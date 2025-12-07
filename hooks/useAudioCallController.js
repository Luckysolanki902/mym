import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import { useFilters } from '@/context/FiltersContext';
import { CALL_STATE, MIC_STATE } from '@/context/AudioCallContext';

const BASE_CHAT_SERVER_URL = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:1000';
const WAIT_TIMEOUT_MS = 15000;
const HEARTBEAT_INTERVAL_MS = 10000;
const QUALITY_SAMPLE_MS = 2000;
const BASE_AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: 1,
};

const hasLiveAudioTrack = (stream) => {
  const tracks = stream?.getAudioTracks?.();
  if (!tracks || !tracks.length) return false;
  return tracks.some((track) => track.readyState === 'live' && track.enabled);
};

const MIC_STATUS_SET = new Set(Object.values(MIC_STATE));
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const normalizeMicState = (value) => {
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (MIC_STATUS_SET.has(upper)) {
      return upper;
    }
  }
  return MIC_STATE.UNKNOWN;
};

const audioDebugLog = (...args) => {
  // Allow disabling logs by setting NEXT_PUBLIC_AUDIO_DEBUG="off"
  if (typeof window !== 'undefined' && window?.localStorage?.getItem('audioDebug') === 'off') return;
  if (process.env.NEXT_PUBLIC_AUDIO_DEBUG && process.env.NEXT_PUBLIC_AUDIO_DEBUG.toLowerCase() === 'off') return;
  console.log('[AudioCall]', ...args);
};

const canRequestUserMedia = () => {
  if (typeof navigator === 'undefined') return false;
  if (navigator.mediaDevices?.getUserMedia) return true;
  const legacy = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  return Boolean(legacy);
};

const buildAudioConstraints = () => {
  if (typeof navigator === 'undefined') {
    return { audio: BASE_AUDIO_CONSTRAINTS, video: false };
  }
  const supported = navigator.mediaDevices?.getSupportedConstraints?.() || {};
  const audioConstraints = {};
  Object.entries(BASE_AUDIO_CONSTRAINTS).forEach(([key, value]) => {
    if (supported[key] || key === 'channelCount') {
      audioConstraints[key] = value;
    }
  });
  if (!Object.keys(audioConstraints).length) {
    return { audio: true, video: false };
  }
  return { audio: audioConstraints, video: false };
};

const shouldRetryWithBasicAudio = (error) => {
  if (!error) return false;
  const retryableNames = new Set(['OverconstrainedError', 'ConstraintNotSatisfiedError', 'TypeError']);
  if (retryableNames.has(error.name)) return true;
  if (typeof error?.message === 'string') {
    return /constraints|not supported|unsupported/i.test(error.message);
  }
  return false;
};

const requestAudioStreamCompat = async () => {
  if (typeof navigator === 'undefined') {
    return Promise.reject(new Error('NAVIGATOR_UNAVAILABLE'));
  }
  const constraints = buildAudioConstraints();
  if (navigator.mediaDevices?.getUserMedia) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      if (shouldRetryWithBasicAudio(error) && constraints.audio !== true) {
        audioDebugLog('Retrying getUserMedia with basic audio constraints', error?.message || error?.name);
        return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }
      throw error;
    }
  }
  const legacy = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  if (legacy) {
    return new Promise((resolve, reject) => {
      try {
        legacy.call(navigator, constraints, resolve, (error) => {
          if (shouldRetryWithBasicAudio(error) && constraints.audio !== true) {
            legacy.call(navigator, { audio: true, video: false }, resolve, reject);
            return;
          }
          reject(error);
        });
      } catch (legacyError) {
        reject(legacyError);
      }
    });
  }
  return Promise.reject(new Error('UNSUPPORTED_USER_MEDIA'));
};

const derivePartnerShape = (payload) => {
  if (!payload) return null;
  // Server sends: strangerGender, stranger (UUID), isStrangerVerified
  // No nickname is ever sent - don't assume it exists
  const gender = payload.strangerGender || payload.gender;
  
  // Log warning if gender is missing - helps debug "Found someone" issue
  if (!gender) {
    audioDebugLog('WARNING: Partner gender is missing from payload', { 
      payload,
      strangerGender: payload.strangerGender,
      gender: payload.gender 
    });
  }
  
  return {
    mid: payload.stranger || payload.userMID,
    gender: gender,
    isVerified: payload.isStrangerVerified || payload.isVerified,
  };
};

const evaluateQualityScore = (stats = {}) => {
  const { rtt = 0, jitter = 0, packetLoss = 0 } = stats;
  const latencyScore = rtt < 120 ? 1 : rtt < 250 ? 0.7 : 0.4;
  const jitterScore = jitter < 15 ? 1 : jitter < 30 ? 0.7 : 0.4;
  const lossScore = packetLoss < 1 ? 1 : packetLoss < 3 ? 0.7 : 0.4;
  const composite = Math.round(((latencyScore + jitterScore + lossScore) / 3) * 100);
  return { ...stats, composite };
};

const useAudioCallController = ({ userDetails, context }) => {
  const {
    setSocket,
    callState,
    setCallState,
    micStatus,
    setMicStatus,
    isFindingPair,
    setIsFindingPair,
    setQueuePosition,
    setQueueSize,
    setFilterLevel,
    setFilterDescription,
    setTelemetry,
    pairingState,
    setPairingState,
    partner,
    setPartner,
    setRoomId,
    roomId,
    setError,
    setWaveformData,
    setCallDuration,
    setCallStartTime,
    setQualityScore,
    setIsMuted,
    isMuted,
    speakerEnabled,
    setSpeakerEnabled,
    partnerDisconnected,
    setPartnerDisconnected,
    userInitiatedEnd,
    setUserInitiatedEnd,
    lastPartnerGender,
    setLastPartnerGender,
    mediaStreamRef,
    analyserRef,
    heartbeatRef,
    remoteAudioRef,
  } = context;

  const { preferredGender, preferredCollege } = useFilters();
  const router = useRouter();

  const socketRef = useRef(null);
  const socketUrlRef = useRef(null);
  const peerRef = useRef(null);
  const peerModuleRef = useRef(null);
  const callRef = useRef(null);
  const localPeerIdRef = useRef(null);
  const remotePeerIdRef = useRef(null);
  const howlerRef = useRef(null);
  const tonePlayersRef = useRef({ connected: null, disconnected: null });
  const callTimerRef = useRef(null);
  const qualityIntervalRef = useRef(null);
  const waveformFrameRef = useRef(null);
  const findingTimeoutRef = useRef(null);
  const peerServerRef = useRef(null);
  const identifyRef = useRef(() => {});
  const micStatusRef = useRef(micStatus);
  const socketHandlersRef = useRef({});
  const isCleaningUpRef = useRef(false);
  const findNewDebounceRef = useRef(false);
  const peerConnectionTimeoutRef = useRef(null);
  const hangupRef = useRef(() => {});
  const audioRouteTargetsRef = useRef({ speaker: 'default', earpiece: 'communications' });
  const outputSelectionLockRef = useRef(false);
  const lastCallStateRef = useRef(callState); // Track last call state to prevent unnecessary updates

  const locationSignature = typeof window === 'undefined' ? 'ssr' : window.location?.href || 'client';

  const resolvedServer = useMemo(() => {
    try {
      const candidate = new URL(BASE_CHAT_SERVER_URL);
      if (typeof window !== 'undefined') {
        const clientHost = window.location.hostname;
        const clientProtocol = window.location.protocol;
        const clientPort = window.location.port || '';
        const envIsLoopback = LOOPBACK_HOSTS.has(candidate.hostname);
        const clientIsLoopback = LOOPBACK_HOSTS.has(clientHost);
        const hostReplaced = envIsLoopback && clientHost && !clientIsLoopback;

        if (hostReplaced) {
          candidate.hostname = clientHost;
          candidate.port = clientPort;
        }

        const shouldForceHttps =
          clientProtocol === 'https:' && candidate.protocol !== 'https:' && clientHost && candidate.hostname === clientHost;

        if (shouldForceHttps) {
          candidate.protocol = 'https:';
          candidate.port = clientPort;
        } else if (clientProtocol === 'https:' && candidate.hostname === clientHost && !clientIsLoopback) {
          // Align the port with the browser when we are already on HTTPS to avoid pointing at non-TLS ports like 1000
          candidate.port = clientPort;
        }

        if (!clientPort && candidate.protocol === 'https:' && candidate.hostname === clientHost) {
          // Explicitly clear the port so URL defaults to 443 instead of keeping stale values
          candidate.port = '';
        }
      }
      return candidate;
    } catch (error) {
      console.error('[AudioCall] Invalid NEXT_PUBLIC_CHAT_SERVER_URL value', error);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const socketUrl = useMemo(() => {
    if (!resolvedServer) return BASE_CHAT_SERVER_URL;
    const value = resolvedServer.toString();
    return value.endsWith('/') ? value.slice(0, -1) : value;
  }, [resolvedServer]);

  const emitSocket = useCallback((event, payload = {}) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, payload);
    }
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, [heartbeatRef]);

  const cleanupAnalyser = useCallback(() => {
    if (analyserRef.current?.audioCtx) {
      try {
        analyserRef.current.audioCtx.close();
      } catch (error) {
        console.warn('[AudioCall] Unable to close AudioContext', error);
      }
    }
    analyserRef.current = null;
  }, [analyserRef]);

  const cleanupStreams = useCallback(() => {
    stopHeartbeat();
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (qualityIntervalRef.current) {
      clearInterval(qualityIntervalRef.current);
      qualityIntervalRef.current = null;
    }
    if (waveformFrameRef.current) {
      cancelAnimationFrame(waveformFrameRef.current);
      waveformFrameRef.current = null;
    }
    if (callRef.current) {
      try {
        callRef.current.close();
      } catch (error) {
        console.warn('[AudioCall] Error closing call', error);
      }
      callRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current.load(); // Force flush buffer
    }
    cleanupAnalyser();
    setWaveformData([]);
    setCallDuration(0);
    setQualityScore(null);
  }, [cleanupAnalyser, remoteAudioRef, setCallDuration, setQualityScore, setWaveformData, stopHeartbeat]);

  const cleanupPeer = useCallback(() => {
    // Note: isCleaningUpRef should be set by the caller (hangup/findNew) before calling this
    // This function focuses on cleanup, not on managing the flag
    audioDebugLog('cleanupPeer called', {
      hasPeer: !!peerRef.current,
      localPeerId: localPeerIdRef.current,
      remotePeerId: remotePeerIdRef.current,
      isCleaningUp: isCleaningUpRef.current,
    });
    
    // Clear any pending timeouts
    if (peerConnectionTimeoutRef.current) {
      clearTimeout(peerConnectionTimeoutRef.current);
      peerConnectionTimeoutRef.current = null;
    }
    
    cleanupStreams();
    
    // Close any active call first
    if (callRef.current) {
      try {
        callRef.current.close();
      } catch (e) {
        audioDebugLog('Error closing call', e?.message);
      }
      callRef.current = null;
    }
    
    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch (e) {
        audioDebugLog('Error destroying peer', e?.message);
      }
      peerRef.current = null;
    }
    
    localPeerIdRef.current = null;
    remotePeerIdRef.current = null;
    peerServerRef.current = null;
    setPartner(null);
    setRoomId(null);
    audioDebugLog('cleanupPeer complete');
  }, [cleanupStreams, setPartner, setRoomId]);

  const stopTones = useCallback((toneKey) => {
    const players = tonePlayersRef.current;
    if (toneKey) {
      players[toneKey]?.stop();
      return;
    }
    Object.values(players).forEach((player) => player?.stop());
  }, []);

  const ensureTones = useCallback(async () => {
    if (typeof window === 'undefined') return tonePlayersRef.current;
    if (!howlerRef.current) {
      const { Howl } = await import('howler');
      howlerRef.current = Howl;
    }
    if (!tonePlayersRef.current.connected) {
      const HowlCtor = howlerRef.current;
      tonePlayersRef.current.connected = new HowlCtor({ src: ['/audio/tone/paired_success_connected_tone.mp3'], volume: 0.35 });
      tonePlayersRef.current.disconnected = new HowlCtor({ src: ['/audio/tone/hang_up-tone.mp3'], volume: 0.35 });
    }
    return tonePlayersRef.current;
  }, []);

  const playTone = useCallback(
    async (tone) => {
      await ensureTones();
      const player = tonePlayersRef.current[tone];
      if (!player) return;
      stopTones(); // Stop any currently playing tone
      player.stop();
      player.volume(0.3);
      player.play();
    },
    [ensureTones, stopTones]
  );

  const handleWaveform = useCallback(
    (stream) => {
      if (!stream || typeof window === 'undefined') return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      cleanupAnalyser();

      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current = { analyser, audioCtx };
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const renderWaveform = () => {
        analyser.getByteTimeDomainData(dataArray);
        const normalized = Array.from(dataArray.slice(0, 32)).map((value) => Number(((value - 128) / 128).toFixed(2)));
        setWaveformData(normalized);
        waveformFrameRef.current = requestAnimationFrame(renderWaveform);
      };
      renderWaveform();
    },
    [analyserRef, cleanupAnalyser, setWaveformData]
  );

  const ensureRemoteAudioElement = useCallback(() => {
    if (remoteAudioRef.current instanceof (typeof HTMLAudioElement !== 'undefined' ? HTMLAudioElement : Object)) {
      return remoteAudioRef.current;
    }
    if (typeof document === 'undefined') return null;
    const audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.playsInline = true;
    audioEl.setAttribute('playsinline', 'true');
    audioEl.setAttribute('webkit-playsinline', 'true');
    audioEl.setAttribute('x5-playsinline', 'true');
    audioEl.setAttribute('x-webkit-airplay', 'deny');
    audioEl.controls = false;
    audioEl.muted = false;
    audioEl.setAttribute('data-role', 'audio-call-remote');
    audioEl.style.position = 'absolute';
    audioEl.style.width = '0px';
    audioEl.style.height = '0px';
    audioEl.style.opacity = '0';
    audioEl.style.pointerEvents = 'none';
    document.body.appendChild(audioEl);
    remoteAudioRef.current = audioEl;
    return audioEl;
  }, [remoteAudioRef]);

  const discoverAudioOutputs = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const outputs = devices.filter((device) => device.kind === 'audiooutput');
      if (!outputs.length) return;
      const speakerCandidate =
        outputs.find((device) => /speaker|default/i.test(device.label)) || outputs.find((device) => device.deviceId === 'default') || outputs[0];
      const earpieceCandidate =
        outputs.find((device) => /earpiece|phone|communications/i.test(device.label)) || outputs.find((device) => device.deviceId === 'communications');

      if (speakerCandidate?.deviceId) {
        audioRouteTargetsRef.current.speaker = speakerCandidate.deviceId;
      }
      if (earpieceCandidate?.deviceId) {
        audioRouteTargetsRef.current.earpiece = earpieceCandidate.deviceId;
      }
    } catch (error) {
      console.warn('[AudioCall] Unable to enumerate audio outputs', error?.message || error);
    }
  }, []);

  const applyAudioRoutePreference = useCallback(
    (preferSpeaker) => {
      const audioElement = ensureRemoteAudioElement();
      if (!audioElement) return;
      audioElement.volume = preferSpeaker ? 1 : 0.65;

      if (typeof audioElement.setSinkId !== 'function') {
        return;
      }

      const desiredDeviceId = preferSpeaker
        ? audioRouteTargetsRef.current.speaker || 'default'
        : audioRouteTargetsRef.current.earpiece || 'communications';

      audioElement
        .setSinkId(desiredDeviceId)
        .catch(async (error) => {
          if (!preferSpeaker && navigator?.mediaDevices?.selectAudioOutput && !outputSelectionLockRef.current) {
            try {
              outputSelectionLockRef.current = true;
              const selection = await navigator.mediaDevices.selectAudioOutput({
                deviceId: 'communications',
                hearingAidCompatibility: true,
              });
              outputSelectionLockRef.current = false;
              if (selection?.deviceId) {
                audioRouteTargetsRef.current.earpiece = selection.deviceId;
                await audioElement.setSinkId(selection.deviceId);
                return;
              }
            } catch (selectError) {
              outputSelectionLockRef.current = false;
              console.warn('[AudioCall] selectAudioOutput failed', selectError?.message || selectError);
            }
          }
          console.warn('[AudioCall] setSinkId failed', error?.message || error);
        });
    },
    [ensureRemoteAudioElement]
  );

  const attachRemoteStream = useCallback(
    (remoteStream) => {
      if (!remoteStream) return;
      const audioElement = ensureRemoteAudioElement();
      if (!audioElement) return;
      audioElement.srcObject = remoteStream;
      audioElement.muted = false;
      applyAudioRoutePreference(speakerEnabled);
      const playAttempt = audioElement.play();
      if (playAttempt?.catch) {
        playAttempt.catch((error) => {
          console.warn('[AudioCall] Unable to autoplay remote stream', error?.message || error);
        });
      }
    },
    [applyAudioRoutePreference, ensureRemoteAudioElement, speakerEnabled]
  );

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;
    discoverAudioOutputs();
    const mediaDevices = navigator.mediaDevices;
    const handleDeviceChange = () => {
      discoverAudioOutputs();
    };
    if (mediaDevices.addEventListener) {
      mediaDevices.addEventListener('devicechange', handleDeviceChange);
      return () => mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    }
    const previousHandler = mediaDevices.ondevicechange;
    mediaDevices.ondevicechange = handleDeviceChange;
    return () => {
      if (mediaDevices.ondevicechange === handleDeviceChange) {
        mediaDevices.ondevicechange = previousHandler || null;
      }
    };
  }, [discoverAudioOutputs]);

  useEffect(() => {
    applyAudioRoutePreference(speakerEnabled);
  }, [applyAudioRoutePreference, speakerEnabled]);

  const requestPeerLibrary = useCallback(async () => {
    if (peerModuleRef.current) return peerModuleRef.current;
    const peerModule = await import('peerjs');
    peerModuleRef.current = peerModule.default || peerModule;
    return peerModuleRef.current;
  }, []);

  const sendCallQualitySample = useCallback(
    (stats) => {
      if (!userDetails) return;
      emitSocket('callQuality', {
        userMID: userDetails.mid,
        ...stats,
      });
      setQualityScore(evaluateQualityScore(stats));
    },
    [emitSocket, setQualityScore, userDetails]
  );

  const startQualityInterval = useCallback(() => {
    if (!callRef.current?.peerConnection) return;
    if (qualityIntervalRef.current) {
      clearInterval(qualityIntervalRef.current);
    }
    qualityIntervalRef.current = setInterval(async () => {
      try {
        const stats = await callRef.current.peerConnection.getStats();
        stats.forEach((report) => {
          if (report.type === 'remote-inbound-rtp' && report.kind === 'audio') {
            const payload = {
              rtt: report.roundTripTime ? Math.round(report.roundTripTime * 1000) : undefined,
              jitter: report.jitter ? Math.round(report.jitter * 1000) : undefined,
              packetLoss:
                report.packetsLost !== undefined && report.packetsReceived
                  ? Number(((report.packetsLost / (report.packetsLost + report.packetsReceived)) * 100).toFixed(2))
                  : undefined,
            };
            sendCallQualitySample(payload);
          }
        });
      } catch (error) {
        console.warn('[AudioCall] Unable to collect call stats', error);
      }
    }, QUALITY_SAMPLE_MS);
  }, [sendCallQualitySample]);

  const startCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    const startedAt = Date.now();
    setCallStartTime(startedAt);
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(Date.now() - startedAt);
    }, 1000);
  }, [setCallDuration, setCallStartTime]);

  const startHeartbeat = useCallback(() => {
    if (!userDetails) return;
    stopHeartbeat();
    heartbeatRef.current = setInterval(() => {
      emitSocket('callHeartbeat', { userMID: userDetails.mid });
    }, HEARTBEAT_INTERVAL_MS);
  }, [emitSocket, heartbeatRef, stopHeartbeat, userDetails]);

  const handleCallLifecycle = useCallback(
    ({ kind, stream, activeRoomId }) => {
      if (kind === 'connected') {
        // Clear any pending end states when successfully connected
        setPartnerDisconnected(false);
        setUserInitiatedEnd(false);
        setCallState(CALL_STATE.CONNECTED);
        setPairingState('CHATTING');
        playTone('connected');
        startCallTimer();
        startQualityInterval();
        startHeartbeat();
        // Use the passed activeRoomId if available, otherwise fall back to context roomId
        const effectiveRoomId = activeRoomId || roomId;
        emitSocket('callConnected', { userMID: userDetails?.mid, roomId: effectiveRoomId });
        if (stream) {
          attachRemoteStream(stream);
        }
      } else if (kind === 'ended') {
        // PeerJS call ended (could be remote close or error)
        // Only process if we're not already cleaning up
        if (isCleaningUpRef.current) {
          audioDebugLog('handleCallLifecycle ended: skipping, cleanup in progress');
          return;
        }
        // Also skip if user already initiated end (hangup was called)
        // This prevents the PeerJS close event from overriding user's hangup
        if (context.userInitiatedEnd) {
          audioDebugLog('handleCallLifecycle ended: skipping, user initiated end');
          return;
        }
        audioDebugLog('handleCallLifecycle ended: processing call end');
        stopTones();
        cleanupStreams();
        // Save partner gender before clearing
        const currentPartnerGender = context.partner?.gender;
        if (currentPartnerGender) {
          setLastPartnerGender(currentPartnerGender);
        }
        // Mark as partner disconnected since this is from PeerJS (not user hangup)
        setPartnerDisconnected(true);
        setCallState(CALL_STATE.ENDED);
        setPairingState('DISCONNECTED');
        setIsFindingPair(false);
        setPartner(null);
        setRoomId(null);
      }
    },
    [attachRemoteStream, cleanupStreams, context.partner?.gender, context.userInitiatedEnd, emitSocket, playTone, roomId, setCallState, setIsFindingPair, setLastPartnerGender, setPairingState, setPartner, setPartnerDisconnected, setRoomId, setUserInitiatedEnd, startCallTimer, startHeartbeat, startQualityInterval, stopTones, userDetails?.mid]
  );

  const attachCallHandlers = useCallback(
    (call, activeRoomId) => {
      callRef.current = call;
      
      // Add timeout to detect stalled connections
      if (peerConnectionTimeoutRef.current) {
        clearTimeout(peerConnectionTimeoutRef.current);
      }
      peerConnectionTimeoutRef.current = setTimeout(() => {
        if (callState === CALL_STATE.DIALING || callState === CALL_STATE.CONNECTING) {
          audioDebugLog('PeerJS connection timeout');
          setError('Connection took too long. Please try again.');
          // Clean up the stalled connection
          if (callRef.current) {
            try {
              callRef.current.close();
            } catch (error) {
              console.warn('[AudioCall] Error closing stalled call', error);
            }
            callRef.current = null;
          }
          // Emit hangup event to server
          if (userDetails) {
            emitSocket('callEnded', { userMID: userDetails.mid, reason: 'connection_timeout' });
          }
          // Show call ended UI instead of auto-retrying
          cleanupPeer();
          setCallState(CALL_STATE.ENDED);
          setUserInitiatedEnd(true); // Show "Call Ended" UI so user can retry
          setIsFindingPair(false);
        }
      }, 15000); // 15s timeout (increased for slower networks)
      
      call.on('stream', (remoteStream) => {
        clearTimeout(peerConnectionTimeoutRef.current);
        audioDebugLog('PeerJS call stream received', {
          remotePeer: remotePeerIdRef.current,
          localPeer: localPeerIdRef.current,
        });
        handleCallLifecycle({ kind: 'connected', stream: remoteStream, activeRoomId });
      });
      call.on('close', () => {
        clearTimeout(peerConnectionTimeoutRef.current);
        audioDebugLog('PeerJS call closed', {
          remotePeer: remotePeerIdRef.current,
          localPeer: localPeerIdRef.current,
        });
        handleCallLifecycle({ kind: 'ended', activeRoomId });
      });
      call.on('error', (err) => {
        clearTimeout(peerConnectionTimeoutRef.current);
        console.error('[AudioCall] Peer call error', err);
        audioDebugLog('PeerJS call error', {
          message: err?.message,
          type: err?.type,
        });
        setError('Connection interrupted. Please try again.');
        handleCallLifecycle({ kind: 'ended', activeRoomId });
      });
    },
    [callState, cleanupPeer, emitSocket, handleCallLifecycle, setCallState, setError, setIsFindingPair, setUserInitiatedEnd, userDetails]
  );

  const maybeInitiateCall = useCallback(() => {
    audioDebugLog('maybeInitiateCall called', {
      hasPeer: !!peerRef.current,
      hasMediaStream: !!mediaStreamRef.current,
      hasRemotePeerId: !!remotePeerIdRef.current,
      hasLocalPeerId: !!localPeerIdRef.current,
      hasExistingCall: !!callRef.current,
      localPeerId: localPeerIdRef.current,
      remotePeerId: remotePeerIdRef.current,
    });
    
    if (!peerRef.current || !mediaStreamRef.current || !remotePeerIdRef.current) {
      audioDebugLog('maybeInitiateCall aborted: missing requirements', {
        hasPeer: !!peerRef.current,
        hasMediaStream: !!mediaStreamRef.current,
        hasRemotePeerId: !!remotePeerIdRef.current,
      });
      return;
    }
    if (!localPeerIdRef.current) {
      audioDebugLog('maybeInitiateCall aborted: no local peer ID');
      return;
    }
    if (callRef.current) {
      audioDebugLog('maybeInitiateCall aborted: call already exists');
      return;
    }
    const shouldInitiate = localPeerIdRef.current.localeCompare(remotePeerIdRef.current) > 0;
    audioDebugLog('maybeInitiateCall decision', {
      localPeer: localPeerIdRef.current,
      remotePeer: remotePeerIdRef.current,
      shouldInitiate,
    });
    if (!shouldInitiate) {
      audioDebugLog('maybeInitiateCall: waiting for partner to initiate (lexically lower peer ID)');
      return;
    }
    try {
      audioDebugLog('Initiating PeerJS call', {
        localPeer: localPeerIdRef.current,
        remotePeer: remotePeerIdRef.current,
        hasStream: Boolean(mediaStreamRef.current),
      });
      const call = peerRef.current.call(remotePeerIdRef.current, mediaStreamRef.current);
      attachCallHandlers(call, roomId);
    } catch (error) {
      console.error('[AudioCall] Failed to initiate call', error);
      setError('Unable to reach partner. Retrying…');
    }
  }, [attachCallHandlers, mediaStreamRef, setError, roomId]);

  const createPeerInstance = useCallback(
    async (token, rtcConfig, serverDescriptor = null, currentRoomId = null) => {
      audioDebugLog('createPeerInstance called', {
        hasToken: !!token,
        token: token,
        roomId: currentRoomId,
        existingPeer: !!peerRef.current,
      });
      if (!token || typeof window === 'undefined') return;
      const PeerCtor = await requestPeerLibrary();
      if (peerRef.current) {
        const oldPeer = peerRef.current;
        peerRef.current = null;
        audioDebugLog('destroying existing peer');
        oldPeer.destroy();
      }
      const win = typeof window !== 'undefined' ? window : undefined;
      const host = serverDescriptor?.host || resolvedServer?.hostname || win?.location?.hostname || 'localhost';
      const rawPort =
        serverDescriptor && Object.prototype.hasOwnProperty.call(serverDescriptor, 'port')
          ? serverDescriptor.port
          : resolvedServer?.port || win?.location?.port || (resolvedServer?.protocol === 'https:' || win?.location?.protocol === 'https:' ? '443' : '80');
      const port = rawPort === '' || rawPort === undefined ? undefined : rawPort;
      const serverSecure =
        typeof serverDescriptor?.secure === 'boolean'
          ? serverDescriptor.secure
          : serverDescriptor?.protocol
          ? serverDescriptor.protocol === 'https:'
          : resolvedServer
          ? resolvedServer.protocol === 'https:'
          : win?.location?.protocol === 'https:';
      const pathCandidate = serverDescriptor?.path || resolvedServer?.pathname || '/peerjs';
      const normalizedPath = pathCandidate.startsWith('/') ? pathCandidate : `/${pathCandidate}`;
      const peerOptions = { host, path: normalizedPath, secure: serverSecure };
      if (port !== undefined) {
        peerOptions.port = port;
      }
      if (rtcConfig?.iceServers?.length) {
        peerOptions.config = { iceServers: rtcConfig.iceServers };
      }
      audioDebugLog('Creating PeerJS instance', {
        host,
        port,
        secure: serverSecure,
        path: normalizedPath,
        serverSource: serverDescriptor ? 'server-payload' : 'resolved-url',
        hasRtcConfig: Boolean(peerOptions.config),
        token: token?.slice?.(-12),
        roomId: currentRoomId,
      });
      const peer = new PeerCtor(token, peerOptions);
      peerRef.current = peer;
      
      // Add timeout for PeerJS server connection
      const peerOpenTimeout = setTimeout(() => {
        if (!localPeerIdRef.current) {
          audioDebugLog('PeerJS open timeout - peer server not responding');
          setError('Could not connect to call server. Please try again.');
          cleanupPeer();
          setCallState(CALL_STATE.ENDED);
          setUserInitiatedEnd(true);
          setIsFindingPair(false);
          if (userDetails) {
            emitSocket('callEnded', { userMID: userDetails.mid, reason: 'peer_server_timeout' });
          }
        }
      }, 10000); // 10s timeout for peer server connection
      
      peer.on('open', (id) => {
        clearTimeout(peerOpenTimeout);
        audioDebugLog('PeerJS connection open', { id, tokenSuffix: token?.slice?.(-8), roomId: currentRoomId });
        localPeerIdRef.current = id;
        emitSocket('callReady', { userMID: userDetails?.mid, peerId: id, roomId: currentRoomId });
        maybeInitiateCall();
      });
      peer.on('call', (incomingCall) => {
        try {
          audioDebugLog('Answering incoming PeerJS call', {
            from: incomingCall?.peer,
            hasStream: Boolean(mediaStreamRef.current),
          });
          incomingCall.answer(mediaStreamRef.current);
          attachCallHandlers(incomingCall, currentRoomId);
        } catch (error) {
          console.error('[AudioCall] Unable to answer call', error);
          audioDebugLog('Error answering incoming call', { message: error?.message });
          setError('Could not answer the call. Trying again…');
        }
      });
      peer.on('error', (err) => {
        console.error('[AudioCall] Peer error', err);
        audioDebugLog('PeerJS error event', { message: err?.message, type: err?.type, isFatal: err?.type === 'socket-error' });
        setError('Peer connection lost. Reconnecting…');
      });
      peer.on('disconnected', () => {
        audioDebugLog('PeerJS disconnected', { peerId: peer.id, isCleaningUp: isCleaningUpRef.current });
        // Only attempt reconnect if we're not intentionally cleaning up
        // This prevents reconnect attempts after hangup/skip
        if (!isCleaningUpRef.current && peerRef.current === peer) {
          audioDebugLog('Attempting PeerJS reconnect');
          peer.reconnect();
        }
      });
      peer.on('close', () => {
        audioDebugLog('PeerJS instance closed', { peerId: peer.id, isCleaningUp: isCleaningUpRef.current });
        // Only cleanup if we haven't already started cleanup
        // This prevents double cleanup and state race conditions
        if (!isCleaningUpRef.current) {
          isCleaningUpRef.current = true;
          cleanupPeer();
          // Don't reset the flag here - let the caller manage it
          // The 'close' event can fire during normal operation, not just errors
          setTimeout(() => {
            isCleaningUpRef.current = false;
          }, 500);
        }
      });
    },
    [attachCallHandlers, cleanupPeer, emitSocket, maybeInitiateCall, mediaStreamRef, requestPeerLibrary, resolvedServer, setCallState, setError, setIsFindingPair, setUserInitiatedEnd, userDetails]
  );

  const buildQueuePayload = useCallback(() => {
    if (!userDetails) return null;
    const payload = {
      userMID: userDetails.mid,
      userGender: userDetails.gender,
      userCollege: userDetails.college,
      preferredGender: preferredGender || 'any',
      preferredCollege: preferredCollege || 'any',
      isVerified: Boolean(userDetails?.isVerified),
    };
    // Debug: Log the payload to verify gender is being sent correctly
    audioDebugLog('buildQueuePayload', { 
      payload, 
      rawGender: userDetails.gender,
      rawMid: userDetails.mid 
    });
    return payload;
  }, [preferredCollege, preferredGender, userDetails]);

  const buildIdentifyPayload = useCallback(
    (options = {}) => {
      const payload = buildQueuePayload();
      if (!payload) return null;
      const candidateStatus = options.micStatusOverride ?? micStatusRef.current ?? micStatus;
      return {
        ...payload,
        pageType: 'audiocall',
        micStatus: normalizeMicState(candidateStatus),
      };
    },
    [buildQueuePayload, micStatus]
  );

  const identifyWithServer = useCallback(
    (options = {}) => {
      const { force = false, micStatusOverride, reason } = options;
      const effectiveMicStatus = normalizeMicState(micStatusOverride ?? micStatusRef.current ?? micStatus);
      audioDebugLog('identifyWithServer invoked', {
        connected: socketRef.current?.connected,
        micStatus: effectiveMicStatus,
        user: userDetails?.mid,
        callState,
        reason,
        force,
      });
      
      // Comprehensive pre-flight checks
      if (!socketRef.current?.connected) {
        audioDebugLog('identifyWithServer aborted: socket not connected');
        return;
      }
      if (!userDetails?.mid) {
        audioDebugLog('identifyWithServer aborted: missing user details');
        return;
      }
      // Only block on CONNECTED state - allow identifying during DIALING/WAITING for reconnection
      if (callState === CALL_STATE.CONNECTED && !force) {
        audioDebugLog('identifyWithServer aborted: already in active call');
        return;
      }
      // Block on ENDED only if not forced
      if (!force && callState === CALL_STATE.ENDED) {
        audioDebugLog('identifyWithServer aborted: call ended, user must click Find New', { callState });
        return;
      }
      if (isCleaningUpRef.current && !force) {
        audioDebugLog('identifyWithServer aborted: cleanup in progress');
        return;
      }
      if (!force && effectiveMicStatus !== MIC_STATE.GRANTED) {
        audioDebugLog('identifyWithServer waiting for mic grant', { micStatus: effectiveMicStatus });
        setMicStatus((prev) => (prev === MIC_STATE.DENIED ? prev : MIC_STATE.PROMPT));
        return;
      }
      const payload = buildIdentifyPayload({ micStatusOverride: effectiveMicStatus });
      if (!payload) {
        audioDebugLog('identifyWithServer aborted: unable to build payload');
        return;
      }

      // Determine if we should join the queue based on current state
      // Only join if we are explicitly finding a pair OR if explicitly requested via options
      const shouldJoinQueue = options.joinQueue !== undefined ? options.joinQueue : isFindingPair;

      audioDebugLog('identifyWithServer emitting identify', {
        userMID: payload.userMID,
        preferredGender: payload.preferredGender,
        preferredCollege: payload.preferredCollege,
        reason,
        joinQueue: shouldJoinQueue,
        currentCallState: callState
      });
      
      emitSocket('identify', { ...payload, joinQueue: shouldJoinQueue });

      // Only update state if we are actually joining the queue
      if (shouldJoinQueue) {
        setIsFindingPair(true);
        setPairingState('FINDING');
        setCallState(CALL_STATE.WAITING);
        setError(null);
        clearTimeout(findingTimeoutRef.current);
        findingTimeoutRef.current = setTimeout(() => {
          setIsFindingPair(false);
          setPairingState('IDLE');
          setError('Taking longer than expected. Tap Find New to retry.');
        }, WAIT_TIMEOUT_MS);
      }
    },
    [buildIdentifyPayload, callState, emitSocket, micStatus, setCallState, setError, setIsFindingPair, setMicStatus, setPairingState, userDetails, isFindingPair]
  );

  const handleQueueStatus = useCallback(
    (data) => {
      audioDebugLog('queueStatus event', data);
      setQueuePosition(data.position || 0);
      setQueueSize(data.queueSize || 0);
      setFilterLevel(data.filterLevel || 1);
      setFilterDescription(data.filterDescription || 'Finding the best match for you');
      setTelemetry((prev) => ({ ...prev, waitTime: data.waitTime, estimatedWait: data.estimatedWait }));
      
      // Only update state if we're not already in a call flow
      // This prevents queue updates from overriding DIALING/CONNECTING states
      if (callState !== CALL_STATE.CONNECTED && 
          callState !== CALL_STATE.DIALING && 
          callState !== CALL_STATE.CONNECTING) {
        setCallState(CALL_STATE.WAITING);
        setPairingState('WAITING');
      }
    },
    [callState, setCallState, setFilterDescription, setFilterLevel, setPairingState, setQueuePosition, setQueueSize, setTelemetry]
  );

  const resetQueueState = useCallback(() => {
    audioDebugLog('resetQueueState called', {
      currentCallState: callState,
      isFindingPair: isFindingPair,
    });
    setIsFindingPair(false);
    setPairingState('IDLE');
    setQueuePosition(0);
    setQueueSize(0);
    setCallState((prev) => (prev === CALL_STATE.CONNECTED ? prev : CALL_STATE.IDLE));
    setTelemetry((prev) => ({ ...prev, waitTime: 0 }));
    audioDebugLog('resetQueueState complete');
  }, [callState, isFindingPair, setCallState, setIsFindingPair, setPairingState, setQueuePosition, setQueueSize, setTelemetry]);

  const handlePairingSuccess = useCallback(
    (payload) => {
      clearTimeout(findingTimeoutRef.current);
      audioDebugLog('pairingSuccess event - full payload', {
        payload,
        strangerGender: payload?.strangerGender,
        stranger: payload?.stranger,
        room: payload?.room,
        matchQuality: payload?.matchQuality,
      });
      const partnerShape = derivePartnerShape(payload);
      audioDebugLog('pairingSuccess - derived partner shape', { partnerShape });
      setPartner(partnerShape);
      setRoomId(payload.room);
      setCallState(CALL_STATE.DIALING);
      setPairingState('DIALING');
      setIsFindingPair(false);
      setPartnerDisconnected(false);
      setUserInitiatedEnd(false); // Clear when new call starts
      setError(null);
      setTelemetry((prev) => ({ ...prev, waitTime: payload.waitTime || 0 }));
      peerServerRef.current = payload.peer?.server || null;
      createPeerInstance(payload.peer?.token, payload.peer?.rtcConfig, peerServerRef.current, payload.room);
    },
    [createPeerInstance, setCallState, setError, setIsFindingPair, setPartner, setPartnerDisconnected, setPairingState, setRoomId, setTelemetry, setUserInitiatedEnd]
  );

  const handleRemoteReady = useCallback(
    ({ peerId }) => {
      audioDebugLog('remoteReady event', { peerId });
      remotePeerIdRef.current = peerId;
      maybeInitiateCall();
    },
    [maybeInitiateCall]
  );

  const handleServerCallEnded = useCallback(
    ({ reason }) => {
      audioDebugLog('callEnded event from server', {
        reason,
        hasActivePeer: !!peerRef.current,
        hasActiveCall: !!callRef.current,
        isCleaningUp: isCleaningUpRef.current,
      });
      
      // Skip if already cleaning up (user already hung up)
      if (isCleaningUpRef.current) {
        audioDebugLog('handleServerCallEnded: skipping, cleanup in progress');
        return;
      }
      
      isCleaningUpRef.current = true;
      
      // Save partner gender before cleanup clears it
      const currentPartner = context.partner;
      if (currentPartner?.gender) {
        setLastPartnerGender(currentPartner.gender);
      }
      stopTones();
      cleanupPeer();
      setPartnerDisconnected(true);
      setCallState(CALL_STATE.ENDED);
      setPairingState('DISCONNECTED');
      setIsFindingPair(false);
      audioDebugLog('callEnded cleanup complete');
      
      // Reset cleanup flag after events settle
      setTimeout(() => {
        isCleaningUpRef.current = false;
      }, 500);
    },
    [cleanupPeer, context.partner, setCallState, setIsFindingPair, setLastPartnerGender, setPartnerDisconnected, setPairingState, stopTones]
  );

  const handlePartnerDisconnected = useCallback(() => {
    audioDebugLog('partnerDisconnected event');
    
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;

    const currentPartnerGender = context.partner?.gender;
    if (currentPartnerGender) {
      setLastPartnerGender(currentPartnerGender);
    }
    stopTones();
    cleanupPeer();
    setPartnerDisconnected(true);
    setCallState(CALL_STATE.ENDED);
    setPairingState('DISCONNECTED');
    setIsFindingPair(false);
    audioDebugLog('pairDisconnected cleanup complete');
    
    setTimeout(() => {
      isCleaningUpRef.current = false;
    }, 500);
  }, [cleanupPeer, context.partner?.gender, setCallState, setIsFindingPair, setLastPartnerGender, setPartnerDisconnected, setPairingState, stopTones]);

  // Keep lastCallStateRef in sync with callState
  useEffect(() => {
    lastCallStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    identifyRef.current = identifyWithServer;
  }, [identifyWithServer]);

  useEffect(() => {
    socketHandlersRef.current = {
      ...socketHandlersRef.current,
      handleQueueStatus,
      handlePairingSuccess,
      handleRemoteReady,
      handleServerCallEnded,
      handlePartnerDisconnected,
      playTone,
      resetQueueState,
      cleanupPeer,
      stopTones,
    };
  }, [cleanupPeer, handlePairingSuccess, handleQueueStatus, handleRemoteReady, handleServerCallEnded, handlePartnerDisconnected, playTone, resetQueueState, stopTones]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    
    audioDebugLog('Socket Effect Triggered', {
      socketUrl,
      currentUrl: socketUrlRef.current,
      hasSocket: !!socketRef.current,
      dependencies: {
        socketUrl,
        // We can't easily log function equality, but we can log if they changed
      }
    });

    if (socketRef.current && socketUrlRef.current === socketUrl) {
      return undefined;
    }

    if (socketRef.current && socketUrlRef.current !== socketUrl) {
      socketRef.current.disconnect();
      socketRef.current = null;
      socketUrlRef.current = null;
      setSocket(null);
    }

    const newSocket = io(socketUrl, { query: { pageType: 'audiocall' } });
    socketRef.current = newSocket;
    socketUrlRef.current = socketUrl;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      audioDebugLog('socket connected', { id: newSocket.id });
      // Always re-identify on reconnect if we have user details
      // This ensures user is in usersMap even after socket drops
      // Skip only if actively cleaning up
      if (isCleaningUpRef.current) {
        audioDebugLog('socket connect: skipping identify, cleanup in progress');
        return;
      }
      // Force identify even in DIALING/WAITING states to handle reconnection
      identifyRef.current({ reason: 'socket-connect', force: true });
    });

    newSocket.on('connect_error', (error) => {
      console.error('[AudioCall] Socket connection error', error);
      setError('Unable to reach audio servers. Retrying…');
      audioDebugLog('socket connect_error', { message: error?.message });
    });

  newSocket.on('queueStatus', (data) => socketHandlersRef.current.handleQueueStatus?.(data));
    newSocket.on('filterLevelChanged', (data) => {
      if (typeof data?.newLevel === 'number') {
        setFilterLevel(data.newLevel);
      }
      if (data?.newDescription) {
        setFilterDescription(data.newDescription);
      }
    });
    newSocket.on('queueJoined', () => {
      audioDebugLog('queueJoined event received', { 
        currentCallState: lastCallStateRef.current,
        isCleaningUp: isCleaningUpRef.current 
      });
      // Only process if we're expecting to join queue (not in active call or ended state)
      if (isCleaningUpRef.current) {
        audioDebugLog('queueJoined: ignoring, cleanup in progress');
        return;
      }
      // Don't override DIALING/CONNECTED states - pairing may have already happened
      if (lastCallStateRef.current === CALL_STATE.DIALING || 
          lastCallStateRef.current === CALL_STATE.CONNECTING ||
          lastCallStateRef.current === CALL_STATE.CONNECTED) {
        audioDebugLog('queueJoined: ignoring, already in call flow', { lastState: lastCallStateRef.current });
        return;
      }
      setIsFindingPair(true);
      setPairingState('WAITING');
      setCallState(CALL_STATE.WAITING);
      // Clear end states when entering queue
      setPartnerDisconnected(false);
      setUserInitiatedEnd(false);
      setError(null);
      clearTimeout(findingTimeoutRef.current);
    });
    newSocket.on('noUsersAvailable', () => {
      audioDebugLog('noUsersAvailable event');
      setPairingState('WAITING');
    });
    newSocket.on('queueTimeout', () => {
      audioDebugLog('queueTimeout event');
      socketHandlersRef.current.resetQueueState?.();
      setError('Queue timed out. Tap Find New to retry.');
    });
    newSocket.on('pairingSuccess', (payload) => socketHandlersRef.current.handlePairingSuccess?.(payload));
    newSocket.on('pairDisconnected', () => {
      socketHandlersRef.current.handlePartnerDisconnected?.();
    });
    newSocket.on('remoteReady', (payload) => socketHandlersRef.current.handleRemoteReady?.(payload));
    newSocket.on('callEnded', (payload) => {
      if (isCleaningUpRef.current) return;
      socketHandlersRef.current.handleServerCallEnded?.(payload);
    });
    newSocket.on('micStatusAck', ({ status }) => {
      const normalized = normalizeMicState(status);
      audioDebugLog('micStatusAck event', { raw: status, normalized });
      setMicStatus(normalized);
    });
    newSocket.on('playTone', ({ tone }) => socketHandlersRef.current.playTone?.(tone));
    newSocket.on('filtersUpdated', (data) => {
      if (data?.newFilters) {
        setFilterDescription('Filters updated');
      }
    });
    newSocket.on('filtersUpdateFailed', (info) => {
      console.warn('[AudioCall] Filter update failed', info);
      audioDebugLog('filtersUpdateFailed event', info);
    });
    newSocket.on('disconnect', () => {
      audioDebugLog('socket disconnected');
      socketRef.current = null;
      socketUrlRef.current = null;
      setSocket(null);
      const { cleanupPeer: cleanupPeerHandler, stopTones: stopTonesHandler } =
        socketHandlersRef.current;
      cleanupPeerHandler?.();
      stopTonesHandler?.();
      // Don't call resetQueueState - it would flip the UI from ENDED to IDLE
      // Just stop finding if we were
      setIsFindingPair(false);
    });

    return () => {
      audioDebugLog('Socket Effect Cleanup - Disconnecting Socket');
      const { cleanupPeer: cleanupPeerHandler, stopTones: stopTonesHandler } = socketHandlersRef.current;
      stopTonesHandler?.();
      cleanupPeerHandler?.();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      socketUrlRef.current = null;
      setSocket(null);
    };
  }, [socketUrl, setSocket, setError, setFilterDescription, setFilterLevel, setIsFindingPair, setPairingState, setCallState, setMicStatus, setPartnerDisconnected, setUserInitiatedEnd, setLastPartnerGender]);

  useEffect(() => {
    if (!socketRef.current?.connected) return;
    if (!isFindingPair) return;
    const payload = buildIdentifyPayload();
    if (!payload) return;
    emitSocket('updateFilters', {
      userMID: payload.userMID,
      preferredGender: payload.preferredGender,
      preferredCollege: payload.preferredCollege,
    });
  }, [buildIdentifyPayload, emitSocket, isFindingPair]);

  useEffect(() => {
    return () => {
      if (findingTimeoutRef.current) {
        clearTimeout(findingTimeoutRef.current);
      }
      if (peerConnectionTimeoutRef.current) {
        clearTimeout(peerConnectionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined') return undefined;
    if (!navigator.permissions?.query) return undefined;
    let cancelled = false;
    let permissionStatus = null;

    const handlePermissionState = (state) => {
      if (cancelled) return;
      audioDebugLog('Microphone permission state change', state);
      if (state === 'denied') {
        setMicStatus(MIC_STATE.DENIED);
        setError('Microphone permission is blocked. Allow it from your browser settings to continue.');
        return;
      }
      if (state === 'prompt') {
        // Only set to PROMPT if we haven't already acquired the stream
        if (!hasLiveAudioTrack(mediaStreamRef.current) && micStatusRef.current !== MIC_STATE.GRANTED) {
          setMicStatus(MIC_STATE.PROMPT);
        }
        return;
      }
      if (state === 'granted') {
        // Permission is granted by browser - if we have a live stream, set to GRANTED
        // Otherwise, keep it as PROMPT so user can click to start (but show "Start Call" text)
        if (hasLiveAudioTrack(mediaStreamRef.current)) {
          setMicStatus(MIC_STATE.GRANTED);
        } else if (micStatusRef.current !== MIC_STATE.GRANTED) {
          // Permission granted but no stream yet - set to PROMPT but the UI will show "Start Call"
          // because we can query permission status separately
          setMicStatus(MIC_STATE.PROMPT);
        }
      }
    };

    navigator.permissions
      .query({ name: 'microphone' })
      .then((status) => {
        if (cancelled || !status) return;
        permissionStatus = status;
        handlePermissionState(status.state);
        status.onchange = () => handlePermissionState(status.state);
      })
      .catch((error) => {
        audioDebugLog('Permissions API unavailable for microphone', error?.message || error);
      });

    return () => {
      cancelled = true;
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [mediaStreamRef, setError, setMicStatus]);

  useEffect(() => {
    audioDebugLog('State transition', {
      callState,
      pairingState,
      isFindingPair,
      hasPartner: !!partner,
      hasPeer: !!peerRef.current,
      hasCall: !!callRef.current,
      hasStream: !!mediaStreamRef.current,
      micStatus,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState, isFindingPair, micStatus]);

  useEffect(() => {
    micStatusRef.current = micStatus;
    audioDebugLog('micStatus changed', micStatus);
  }, [micStatus]);

  // Monitor mic stream health during call
  useEffect(() => {
    if (!mediaStreamRef.current) return;
    if (callState !== CALL_STATE.CONNECTED) return;
    
    const track = mediaStreamRef.current.getAudioTracks()[0];
    if (!track) return;
    
    const handleTrackEnded = () => {
      audioDebugLog('Audio track ended unexpectedly during call');
      setError('Microphone access lost. Hanging up...');
      setMicStatus(MIC_STATE.DENIED);
      hangupRef.current('mic_lost');
    };
    
    track.addEventListener('ended', handleTrackEnded);
    
    return () => {
      track.removeEventListener('ended', handleTrackEnded);
    };
  }, [callState, mediaStreamRef, setError, setMicStatus]);

  useEffect(() => {
    const hasLiveTrack = hasLiveAudioTrack(mediaStreamRef.current);
    if (micStatus === MIC_STATE.GRANTED && hasLiveTrack) {
      if (callState === CALL_STATE.PREPARING_MIC) {
        // If we were preparing mic, we can now proceed.
        // If we were already finding a pair (e.g. user clicked "Find New" before mic was ready), go to WAITING.
        // Otherwise, go to IDLE (Ready to Connect).
        setCallState(isFindingPair ? CALL_STATE.WAITING : CALL_STATE.IDLE);
      }
      return;
    }
    if (micStatus === MIC_STATE.GRANTED && !hasLiveTrack) {
      audioDebugLog('Mic marked granted but no live track; reverting to prompt state');
      setMicStatus(MIC_STATE.PROMPT);
      if (callState === CALL_STATE.PREPARING_MIC) {
        setCallState(CALL_STATE.IDLE);
      }
    }
  }, [callState, isFindingPair, mediaStreamRef, micStatus, setCallState, setMicStatus]);

  useEffect(() => {
    if (!socketRef.current?.connected) return;
    if (isFindingPair) return;
    // Don't auto-identify if in any active/end call state - user should explicitly click Find New
    if ([CALL_STATE.WAITING, CALL_STATE.DIALING, CALL_STATE.CONNECTING, CALL_STATE.CONNECTED, CALL_STATE.RECONNECTING, CALL_STATE.ENDED].includes(callState)) return;
    const normalized = normalizeMicState(micStatus);
    if (normalized !== MIC_STATE.GRANTED) return;
    identifyRef.current({ reason: 'mic-granted-effect' });
  }, [callState, isFindingPair, micStatus]);

  const requestMicAccess = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const isSecure = window.isSecureContext ?? window.location?.protocol === 'https:';
    if (!isSecure) {
      setError('Microphone requires a secure (https) connection. Please reopen Meet Your Mate over https.');
      setCallState(CALL_STATE.IDLE);
      return;
    }
    if (!canRequestUserMedia()) {
      setError('This browser cannot access the microphone. Please switch to the latest Chrome or Safari.');
      setCallState(CALL_STATE.IDLE);
      setMicStatus(MIC_STATE.DENIED);
      return;
    }

    const hasDocument = typeof document !== 'undefined';
    audioDebugLog('requestMicAccess invoked', {
      currentStatus: micStatus,
      userGestureSupported: hasDocument ? document.hasStorageAccess !== undefined : null,
    });

    if (micStatus === MIC_STATE.GRANTED && mediaStreamRef.current) {
      audioDebugLog('requestMicAccess short-circuit: already granted');
      identifyWithServer({ reason: 'already-granted' });
      return;
    }

    try {
      setCallState(CALL_STATE.PREPARING_MIC);
      setMicStatus(MIC_STATE.PROMPT);
      const stream = await requestAudioStreamCompat();
      mediaStreamRef.current = stream;
      setMicStatus(MIC_STATE.GRANTED);
      audioDebugLog('Microphone permission granted', {
        tracks: stream?.getAudioTracks?.().length,
      });
      handleWaveform(stream);
      
      // Auto-start finding a pair immediately after mic is granted
      setCallState(CALL_STATE.WAITING);
      setIsFindingPair(true);
      setPairingState('FINDING');
      
      emitSocket('micPermissionResult', { userMID: userDetails?.mid, status: MIC_STATE.GRANTED });
      // Pass joinQueue: true to identifyWithServer
      identifyWithServer({ force: true, micStatusOverride: MIC_STATE.GRANTED, reason: 'mic-granted', joinQueue: true });
    } catch (error) {
      const errorName = error?.name || error?.code || 'unknown';
      console.error('[AudioCall] Microphone permission error', error);
      setMicStatus(MIC_STATE.DENIED);
      setCallState(CALL_STATE.IDLE);
      let friendlyMessage = 'Microphone access is required. Please allow access to continue.';
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        friendlyMessage = 'Microphone permission was blocked. Please enable it from your browser settings and retry.';
      } else if (errorName === 'NotReadableError') {
        friendlyMessage = 'We could not read from your microphone. Make sure no other app is using it and try again.';
      } else if (errorName === 'SecurityError' || error?.message?.includes('secure context')) {
        friendlyMessage = 'Microphone needs a secure connection. Please reload this page over https or use the official site.';
      }
      setError(friendlyMessage);
      emitSocket('micPermissionResult', { userMID: userDetails?.mid, status: MIC_STATE.DENIED });
      audioDebugLog('Microphone permission denied', { message: error?.message, errorName });
    }
  }, [emitSocket, handleWaveform, identifyWithServer, mediaStreamRef, micStatus, setCallState, setError, setMicStatus, userDetails?.mid, setIsFindingPair, setPairingState]);

  const handleMuteToggle = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    const track = mediaStreamRef.current?.getAudioTracks?.()[0];
    if (track) {
      track.enabled = !next;
    }
  }, [isMuted, mediaStreamRef, setIsMuted]);

  const handleSpeakerToggle = useCallback(() => {
    const next = !speakerEnabled;
    setSpeakerEnabled(next);
    applyAudioRoutePreference(next);
  }, [applyAudioRoutePreference, setSpeakerEnabled, speakerEnabled]);

  const emitFindNew = useCallback(
    (eventName = 'findNewPair') => {
      const payload = buildQueuePayload();
      if (!payload) return;
      emitSocket(eventName, payload);
    },
    [buildQueuePayload, emitSocket]
  );

  const hangup = useCallback(
    (reason = 'hangup') => {
      if (!userDetails) return;
      
      // Set cleanup flag FIRST to prevent race conditions with PeerJS events
      isCleaningUpRef.current = true;
      
      emitSocket('callEnded', { userMID: userDetails.mid, reason });
      stopTones();
      cleanupPeer();
      // Don't call resetQueueState() here - it sets callState to IDLE 
      // which causes a brief flash before ENDED is set, triggering animation loops
      // Instead, directly set the final state
      setQueuePosition(0);
      setQueueSize(0);
      setPairingState('IDLE');
      setCallState(CALL_STATE.ENDED);
      setIsFindingPair(false);
      setPartnerDisconnected(false);
      setUserInitiatedEnd(true); // Mark that user initiated the hangup
      if (findingTimeoutRef.current) {
        clearTimeout(findingTimeoutRef.current);
      }
      
      // Reset cleanup flag after a short delay to allow all events to settle
      setTimeout(() => {
        isCleaningUpRef.current = false;
      }, 500);
    },
    [cleanupPeer, emitSocket, stopTones, userDetails, setCallState, setIsFindingPair, setPartnerDisconnected, setPairingState, setQueuePosition, setQueueSize, setUserInitiatedEnd]
  );
  
  // Update hangupRef for early useEffect hooks
  useEffect(() => {
    hangupRef.current = hangup;
  }, [hangup]);

  const findNew = useCallback(() => {
    if (!userDetails) return;
    
    if (findNewDebounceRef.current) {
      audioDebugLog('Find new already in progress, ignoring');
      return;
    }
    
    findNewDebounceRef.current = true;
    isCleaningUpRef.current = false; // Reset cleanup flag since we're actively finding new
    
    // IMPORTANT: Set state to WAITING BEFORE any cleanup
    // This prevents identifyWithServer from being blocked on socket reconnect
    setCallState(CALL_STATE.WAITING);
    setUserInitiatedEnd(false);
    setPartnerDisconnected(false);
    setLastPartnerGender(null);
    setIsFindingPair(true);
    setPairingState('FINDING');
    setError(null);
    
    // Now cleanup - if socket disconnects/reconnects, state is already WAITING so identify will work
    emitSocket('callEnded', { userMID: userDetails.mid, reason: 'skip' });
    stopTones();
    cleanupPeer();
    
    // Re-identify with server to ensure we're in the queue
    // Build payload directly since we need fresh data
    const payload = {
      userMID: userDetails.mid,
      userGender: userDetails.gender,
      userCollege: userDetails.college,
      preferredGender: preferredGender || 'any',
      preferredCollege: preferredCollege || 'any',
      isVerified: Boolean(userDetails?.isVerified),
      pageType: 'audiocall',
      micStatus: MIC_STATE.GRANTED,
      joinQueue: true, // Explicitly request queue join
    };
    
    // Use identify instead of findNewPair to ensure user is in usersMap
    emitSocket('identify', payload);
    
    setTelemetry((prev) => ({ ...prev, attempts: (prev?.attempts || 0) + 1 }));
    clearTimeout(findingTimeoutRef.current);
    findingTimeoutRef.current = setTimeout(() => {
      // Only reset if we are still in WAITING state (haven't found a partner yet)
      if (lastCallStateRef.current === CALL_STATE.WAITING) {
        setIsFindingPair(false);
        setPairingState('IDLE');
        setCallState(CALL_STATE.IDLE);
        setError('No one available. Tap to try again.');
      }
    }, WAIT_TIMEOUT_MS);
    
    // Reset debounce after a short delay
    setTimeout(() => {
      findNewDebounceRef.current = false;
    }, 500);
  }, [cleanupPeer, emitSocket, preferredCollege, preferredGender, setCallState, setError, setIsFindingPair, setLastPartnerGender, setPartnerDisconnected, setPairingState, setTelemetry, setUserInitiatedEnd, stopTones, userDetails]);

  const skip = useCallback(() => {
    findNew();
  }, [findNew]);

  // Handle navigation away from the page
  useEffect(() => {
    const handleRouteChange = (url) => {
      // If navigating to a different page, hang up the call
      // We check if the new URL is different from the current one to avoid triggering on shallow routing if not intended
      if (url !== router.asPath) {
        audioDebugLog('Navigation detected, hanging up call');
        hangupRef.current('navigation');
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return {
    requestMicAccess,
    hangup,
    skip,
    findNew,
    toggleMute: handleMuteToggle,
    toggleSpeaker: handleSpeakerToggle,
    socketConnected: Boolean(socketRef.current?.connected),
    isMuted,
    speakerEnabled,
  };
};

export default useAudioCallController;