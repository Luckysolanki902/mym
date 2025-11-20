import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

const AudioCallContext = createContext(null);

export const CALL_STATE = Object.freeze({
  IDLE: 'IDLE',
  PREPARING_MIC: 'PREPARING_MIC',
  WAITING: 'WAITING',
  DIALING: 'DIALING',
  CONNECTED: 'CONNECTED',
  RECONNECTING: 'RECONNECTING',
  ENDED: 'ENDED',
});

export const MIC_STATE = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  PROMPT: 'PROMPT',
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
});

const defaultTelemetry = {
  waitTime: 0,
  avgWaitTime: 0,
  attempts: 0,
};

export const AudioCallProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callState, setCallState] = useState(CALL_STATE.IDLE);
  const [micStatus, setMicStatus] = useState(MIC_STATE.UNKNOWN);
  const [isFindingPair, setIsFindingPair] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [queueSize, setQueueSize] = useState(0);
  const [filterLevel, setFilterLevel] = useState(1);
  const [filterDescription, setFilterDescription] = useState('');
  const [partner, setPartner] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [dialToneEnabled, setDialToneEnabled] = useState(true);
  const [waveformData, setWaveformData] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [qualityScore, setQualityScore] = useState(null);
  const [pairingState, setPairingState] = useState('IDLE');
  const [telemetry, setTelemetry] = useState(defaultTelemetry);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(false);
  const [partnerDisconnected, setPartnerDisconnected] = useState(false);

  const mediaStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const heartbeatRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const value = useMemo(
    () => ({
      socket,
      setSocket,
      peer,
      setPeer,
      callState,
      setCallState,
      micStatus,
      setMicStatus,
      isFindingPair,
      setIsFindingPair,
      queuePosition,
      setQueuePosition,
      queueSize,
      setQueueSize,
      filterLevel,
      setFilterLevel,
      filterDescription,
      setFilterDescription,
      partner,
      setPartner,
      roomId,
      setRoomId,
      dialToneEnabled,
      setDialToneEnabled,
      waveformData,
      setWaveformData,
      callDuration,
      setCallDuration,
      callStartTime,
      setCallStartTime,
      qualityScore,
      setQualityScore,
      pairingState,
      setPairingState,
      telemetry,
      setTelemetry,
      error,
      setError,
      isMuted,
      setIsMuted,
      speakerEnabled,
      setSpeakerEnabled,
      partnerDisconnected,
      setPartnerDisconnected,
      mediaStreamRef,
      analyserRef,
      heartbeatRef,
      remoteAudioRef,
    }),
    [
      socket,
      peer,
      callState,
      micStatus,
      isFindingPair,
      queuePosition,
      queueSize,
      filterLevel,
      filterDescription,
      partner,
      roomId,
      dialToneEnabled,
      waveformData,
      callDuration,
      callStartTime,
      qualityScore,
      pairingState,
      telemetry,
      error,
      isMuted,
      speakerEnabled,
      partnerDisconnected,
    ]
  );

  return <AudioCallContext.Provider value={value}>{children}</AudioCallContext.Provider>;
};

export const useAudioCall = () => {
  const ctx = useContext(AudioCallContext);
  if (!ctx) {
    throw new Error('useAudioCall must be used within an AudioCallProvider');
  }
  return ctx;
};
