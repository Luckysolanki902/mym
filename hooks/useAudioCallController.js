import { useCallback, useEffect, useMemo, useRef } from 'react';
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

const getPartnerLabel = (data, fallback = 'Friend') => {
  if (!data) return fallback;
  const base = data.nickname || data.userMID || fallback;
  return base;
};

const derivePartnerShape = (payload) => {
  if (!payload) return null;
  const initial = payload?.nickname?.[0] || payload?.userMID?.[0] || 'U';
  return {
    mid: payload.stranger || payload.userMID,
    gender: payload.strangerGender || payload.gender,
    isVerified: payload.isStrangerVerified || payload.isVerified,
    initials: initial.toUpperCase(),
    nickname: getPartnerLabel(payload),
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
    setPairingState,
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
    mediaStreamRef,
    analyserRef,
    heartbeatRef,
    remoteAudioRef,
  } = context;

  const { preferredGender, preferredCollege } = useFilters();

  const socketRef = useRef(null);
  const socketUrlRef = useRef(null);
  const peerRef = useRef(null);
  const peerModuleRef = useRef(null);
  const callRef = useRef(null);
  const localPeerIdRef = useRef(null);
  const remotePeerIdRef = useRef(null);
  const howlerRef = useRef(null);
  const tonePlayersRef = useRef({ dial: null, connected: null, disconnected: null });
  const callTimerRef = useRef(null);
  const qualityIntervalRef = useRef(null);
  const waveformFrameRef = useRef(null);
  const findingTimeoutRef = useRef(null);
  const peerServerRef = useRef(null);
  const identifyRef = useRef(() => {});
  const micStatusRef = useRef(micStatus);
  const socketHandlersRef = useRef({});

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
  }, [BASE_CHAT_SERVER_URL, locationSignature]);

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
    }
    cleanupAnalyser();
    setWaveformData([]);
    setCallDuration(0);
    setQualityScore(null);
  }, [cleanupAnalyser, remoteAudioRef, setCallDuration, setQualityScore, setWaveformData, stopHeartbeat]);

  const cleanupPeer = useCallback(() => {
    audioDebugLog('cleanupPeer called', {
      hasPeer: !!peerRef.current,
      localPeerId: localPeerIdRef.current,
      remotePeerId: remotePeerIdRef.current,
    });
    cleanupStreams();
    if (peerRef.current) {
      peerRef.current.destroy();
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
    if (!tonePlayersRef.current.dial) {
      const HowlCtor = howlerRef.current;
      tonePlayersRef.current.dial = new HowlCtor({ src: ['/audio/tone/ringing_tone.mp3'], loop: true, volume: 0.25 });
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
      if (tone === 'dial') {
        stopTones('connected');
        stopTones('disconnected');
        player.stop();
        player.volume(0.25); // Lowered from default for soothing effect
        player.play();
      } else {
        stopTones('dial');
        player.stop();
        player.volume(0.3);
        player.play();
      }
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

  const attachRemoteStream = useCallback(
    (remoteStream) => {
      if (!remoteStream) return;
      const audioElement = ensureRemoteAudioElement();
      if (!audioElement) return;
      audioElement.srcObject = remoteStream;
      audioElement.muted = false;
      audioElement.volume = speakerEnabled ? 1 : 0.65;
      const playAttempt = audioElement.play();
      if (playAttempt?.catch) {
        playAttempt.catch((error) => {
          console.warn('[AudioCall] Unable to autoplay remote stream', error?.message || error);
        });
      }
    },
    [ensureRemoteAudioElement, speakerEnabled]
  );

  const requestPeerLibrary = useCallback(async () => {
    if (peerModuleRef.current) return peerModuleRef.current;
    const module = await import('peerjs');
    peerModuleRef.current = module.default || module;
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
    ({ kind, stream }) => {
      if (kind === 'connected') {
        setCallState(CALL_STATE.CONNECTED);
        setPairingState('CHATTING');
        stopTones('dial');
        playTone('connected');
        startCallTimer();
        startQualityInterval();
        startHeartbeat();
        emitSocket('callConnected', { userMID: userDetails?.mid, roomId });
        if (stream) {
          attachRemoteStream(stream);
        }
      } else if (kind === 'ended') {
        stopTones();
        cleanupStreams();
        setCallState(CALL_STATE.ENDED);
        setPairingState('IDLE');
        setPartner(null);
        setRoomId(null);
      }
    },
    [attachRemoteStream, cleanupStreams, emitSocket, playTone, roomId, setCallState, setPairingState, setPartner, setRoomId, startCallTimer, startHeartbeat, startQualityInterval, stopTones, userDetails?.mid]
  );

  const attachCallHandlers = useCallback(
    (call) => {
      callRef.current = call;
      call.on('stream', (remoteStream) => {
        audioDebugLog('PeerJS call stream received', {
          remotePeer: remotePeerIdRef.current,
          localPeer: localPeerIdRef.current,
        });
        handleCallLifecycle({ kind: 'connected', stream: remoteStream });
      });
      call.on('close', () => {
        audioDebugLog('PeerJS call closed', {
          remotePeer: remotePeerIdRef.current,
          localPeer: localPeerIdRef.current,
        });
        handleCallLifecycle({ kind: 'ended' });
      });
      call.on('error', (err) => {
        console.error('[AudioCall] Peer call error', err);
        audioDebugLog('PeerJS call error', {
          message: err?.message,
          type: err?.type,
        });
        setError('Connection interrupted. Trying to recover…');
        handleCallLifecycle({ kind: 'ended' });
      });
    },
    [handleCallLifecycle, setError]
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
      attachCallHandlers(call);
    } catch (error) {
      console.error('[AudioCall] Failed to initiate call', error);
      setError('Unable to reach partner. Retrying…');
    }
  }, [attachCallHandlers, mediaStreamRef, setError]);

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
        audioDebugLog('destroying existing peer');
        peerRef.current.destroy();
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
      peer.on('open', (id) => {
        audioDebugLog('PeerJS connection open', { id, tokenSuffix: token?.slice?.(-8), roomId: currentRoomId });
        localPeerIdRef.current = id;
        emitSocket('callReady', { userMID: userDetails?.mid, peerId: id, roomId: currentRoomId });
      });
      peer.on('call', (incomingCall) => {
        try {
          audioDebugLog('Answering incoming PeerJS call', {
            from: incomingCall?.peer,
            hasStream: Boolean(mediaStreamRef.current),
          });
          incomingCall.answer(mediaStreamRef.current);
          attachCallHandlers(incomingCall);
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
        audioDebugLog('PeerJS disconnected, attempting reconnect', { peerId: peer.id });
        peer.reconnect();
      });
      peer.on('close', () => {
        audioDebugLog('PeerJS instance closed', { peerId: peer.id });
        cleanupPeer();
      });
    },
    [attachCallHandlers, cleanupPeer, emitSocket, mediaStreamRef, requestPeerLibrary, resolvedServer, setError, userDetails?.mid]
  );

  const buildQueuePayload = useCallback(() => {
    if (!userDetails) return null;
    return {
      userMID: userDetails.mid,
      userGender: userDetails.gender,
      userCollege: userDetails.college,
      preferredGender: preferredGender || 'any',
      preferredCollege: preferredCollege || 'any',
      isVerified: Boolean(userDetails?.isVerified),
    };
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
        reason,
        force,
      });
      if (!socketRef.current?.connected) {
        audioDebugLog('identifyWithServer aborted: socket not connected');
        return;
      }
      if (!userDetails) {
        audioDebugLog('identifyWithServer aborted: missing user details');
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
      audioDebugLog('identifyWithServer emitting identify', {
        userMID: payload.userMID,
        preferredGender: payload.preferredGender,
        preferredCollege: payload.preferredCollege,
        reason,
      });
      emitSocket('identify', payload);
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
    },
    [buildIdentifyPayload, emitSocket, micStatus, setCallState, setError, setIsFindingPair, setMicStatus, setPairingState, userDetails]
  );

  const handleQueueStatus = useCallback(
    (data) => {
      audioDebugLog('queueStatus event', data);
      setQueuePosition(data.position || 0);
      setQueueSize(data.queueSize || 0);
      setFilterLevel(data.filterLevel || 1);
      setFilterDescription(data.filterDescription || 'Finding the best match for you');
      setTelemetry((prev) => ({ ...prev, waitTime: data.waitTime, estimatedWait: data.estimatedWait }));
      if (callState !== CALL_STATE.CONNECTED) {
        setCallState(CALL_STATE.WAITING);
      }
      setPairingState('WAITING');
      // Ensure ringing tone is playing while waiting
      playTone('dial');
    },
    [callState, playTone, setCallState, setFilterDescription, setFilterLevel, setPairingState, setQueuePosition, setQueueSize, setTelemetry]
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
      audioDebugLog('pairingSuccess event', payload);
      const partnerShape = derivePartnerShape(payload);
      setPartner(partnerShape);
      setRoomId(payload.room);
      setCallState(CALL_STATE.DIALING);
      setPairingState('DIALING');
      setIsFindingPair(false);
      setPartnerDisconnected(false);
      setError(null);
      setTelemetry((prev) => ({ ...prev, waitTime: payload.waitTime || 0 }));
      playTone('dial');
      peerServerRef.current = payload.peer?.server || null;
      createPeerInstance(payload.peer?.token, payload.peer?.rtcConfig, peerServerRef.current, payload.room);
    },
    [createPeerInstance, playTone, setCallState, setError, setIsFindingPair, setPartner, setPartnerDisconnected, setPairingState, setRoomId, setTelemetry]
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
      });
      stopTones();
      cleanupPeer();
      setPartnerDisconnected(true);
      setCallState(CALL_STATE.ENDED);
      setPairingState('DISCONNECTED');
      setIsFindingPair(false);
      audioDebugLog('callEnded cleanup complete');
    },
    [cleanupPeer, setCallState, setIsFindingPair, setPartnerDisconnected, setPairingState, stopTones]
  );

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
      playTone,
      resetQueueState,
      cleanupPeer,
      stopTones,
    };
  }, [cleanupPeer, handlePairingSuccess, handleQueueStatus, handleRemoteReady, handleServerCallEnded, playTone, resetQueueState, stopTones]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
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
      identifyRef.current({ reason: 'socket-connect' });
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
      audioDebugLog('queueJoined event received');
      setIsFindingPair(true);
      setPairingState('WAITING');
      setCallState(CALL_STATE.WAITING);
      setError(null);
      clearTimeout(findingTimeoutRef.current);
      socketHandlersRef.current.playTone?.('dial');
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
      audioDebugLog('pairDisconnected event', {
        hasActivePeer: !!peerRef.current,
        hasActiveCall: !!callRef.current,
      });
      socketHandlersRef.current.stopTones?.();
      socketHandlersRef.current.cleanupPeer?.();
      setPartnerDisconnected(true);
      setCallState(CALL_STATE.ENDED);
      setPairingState('DISCONNECTED');
      setIsFindingPair(false);
      audioDebugLog('pairDisconnected cleanup complete');
    });
    newSocket.on('remoteReady', (payload) => socketHandlersRef.current.handleRemoteReady?.(payload));
    newSocket.on('callEnded', (payload) => socketHandlersRef.current.handleServerCallEnded?.(payload));
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
      const { cleanupPeer: cleanupPeerHandler, resetQueueState: resetQueueStateHandler, stopTones: stopTonesHandler } =
        socketHandlersRef.current;
      cleanupPeerHandler?.();
      resetQueueStateHandler?.();
      stopTonesHandler?.();
    });

    return () => {
      audioDebugLog('audio call controller cleanup');
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
  }, [socketUrl, setSocket, setError, setFilterDescription, setFilterLevel, setIsFindingPair, setPairingState, setCallState, setMicStatus, setPartnerDisconnected]);

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
      if (state === 'prompt' && micStatusRef.current !== MIC_STATE.PROMPT) {
        setMicStatus(MIC_STATE.PROMPT);
        return;
      }
      if (state === 'granted' && !hasLiveAudioTrack(mediaStreamRef.current)) {
        setMicStatus((prev) => (prev === MIC_STATE.GRANTED ? MIC_STATE.PROMPT : prev));
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
    audioDebugLog('callState changed', callState);
  }, [callState]);

  useEffect(() => {
    micStatusRef.current = micStatus;
    audioDebugLog('micStatus changed', micStatus);
  }, [micStatus]);

  useEffect(() => {
    const hasLiveTrack = hasLiveAudioTrack(mediaStreamRef.current);
    if (micStatus === MIC_STATE.GRANTED && hasLiveTrack) {
      if (callState === CALL_STATE.PREPARING_MIC) {
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
    if ([CALL_STATE.WAITING, CALL_STATE.DIALING, CALL_STATE.CONNECTED].includes(callState)) return;
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
      setCallState(CALL_STATE.WAITING);
  emitSocket('micPermissionResult', { userMID: userDetails?.mid, status: MIC_STATE.GRANTED });
  identifyWithServer({ force: true, micStatusOverride: MIC_STATE.GRANTED, reason: 'mic-granted' });
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
  }, [emitSocket, handleWaveform, identifyWithServer, mediaStreamRef, micStatus, setCallState, setError, setMicStatus, userDetails?.mid]);

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
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = next ? 1 : 0.65;
    }
  }, [remoteAudioRef, setSpeakerEnabled, speakerEnabled]);

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
      emitSocket('callEnded', { userMID: userDetails.mid, reason });
      stopTones();
      cleanupPeer();
      resetQueueState();
    },
    [cleanupPeer, emitSocket, resetQueueState, stopTones, userDetails]
  );

  const findNew = useCallback(() => {
    if (!userDetails) return;
    hangup('skip');
    emitFindNew('findNewPair');
    setIsFindingPair(true);
    setPairingState('FINDING');
    setCallState(CALL_STATE.WAITING);
    setError(null);
    setTelemetry((prev) => ({ ...prev, attempts: (prev?.attempts || 0) + 1 }));
    clearTimeout(findingTimeoutRef.current);
    findingTimeoutRef.current = setTimeout(() => {
      setIsFindingPair(false);
      setPairingState('IDLE');
    }, WAIT_TIMEOUT_MS);
  }, [emitFindNew, hangup, setCallState, setError, setIsFindingPair, setPairingState, setTelemetry, userDetails]);

  const skip = useCallback(() => {
    findNew();
  }, [findNew]);

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