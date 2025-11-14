import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { CALL_STATUS, PAIRING_STATE, QUEUE_DEFAULTS } from '@/utils/audioCall/constants';

const AudioCallContext = createContext(null);

const ACTIONS = {
  SET_SOCKET: 'SET_SOCKET',
  SET_PEER: 'SET_PEER',
  SET_PAIRING_STATE: 'SET_PAIRING_STATE',
  SET_CALL_STATUS: 'SET_CALL_STATUS',
  SET_QUEUE_METRICS: 'SET_QUEUE_METRICS',
  SET_CALL_CONTEXT: 'SET_CALL_CONTEXT',
  SET_CALL_READY: 'SET_CALL_READY',
  SET_LOCAL_STREAM: 'SET_LOCAL_STREAM',
  SET_REMOTE_STREAM: 'SET_REMOTE_STREAM',
  SET_ERROR: 'SET_ERROR',
  SET_USER: 'SET_USER',
  SET_PARTNER: 'SET_PARTNER',
  TOGGLE_MUTE: 'TOGGLE_MUTE',
  SET_MUTED: 'SET_MUTED',
  SET_SPEAKER: 'SET_SPEAKER',
  SET_SOUNDS: 'SET_SOUNDS',
  SET_CALL_DURATION: 'SET_CALL_DURATION',
  RESET_CALL: 'RESET_CALL',
  RESET_STATE: 'RESET_STATE'
};

const initialState = {
  socket: null,
  peer: null,
  user: null,
  partner: null,
  pairingState: PAIRING_STATE.IDLE,
  callStatus: CALL_STATUS.IDLE,
  queueMetrics: { ...QUEUE_DEFAULTS },
  callContext: null,
  callReady: null,
  localStream: null,
  remoteStream: null,
  error: null,
  isMuted: false,
  isSpeakerEnabled: true,
  soundsEnabled: true,
  callDurationSeconds: 0
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_SOCKET:
      return { ...state, socket: action.payload };
    case ACTIONS.SET_PEER:
      return { ...state, peer: action.payload };
    case ACTIONS.SET_PAIRING_STATE:
      return { ...state, pairingState: action.payload };
    case ACTIONS.SET_CALL_STATUS:
      return { ...state, callStatus: action.payload };
    case ACTIONS.SET_QUEUE_METRICS:
      return { ...state, queueMetrics: { ...state.queueMetrics, ...action.payload } };
    case ACTIONS.SET_CALL_CONTEXT:
      return { ...state, callContext: action.payload };
    case ACTIONS.SET_CALL_READY:
      return { ...state, callReady: action.payload };
    case ACTIONS.SET_LOCAL_STREAM:
      return { ...state, localStream: action.payload };
    case ACTIONS.SET_REMOTE_STREAM:
      return { ...state, remoteStream: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload };
    case ACTIONS.SET_PARTNER:
      return { ...state, partner: action.payload };
    case ACTIONS.TOGGLE_MUTE:
      return { ...state, isMuted: !state.isMuted };
    case ACTIONS.SET_MUTED:
      return { ...state, isMuted: action.payload };
    case ACTIONS.SET_SPEAKER:
      return { ...state, isSpeakerEnabled: action.payload };
    case ACTIONS.SET_SOUNDS:
      return { ...state, soundsEnabled: action.payload };
    case ACTIONS.SET_CALL_DURATION:
      return { ...state, callDurationSeconds: action.payload };
    case ACTIONS.RESET_CALL:
      return {
        ...state,
        pairingState: PAIRING_STATE.IDLE,
        callStatus: CALL_STATUS.IDLE,
        callContext: null,
        callReady: null,
        partner: null,
        remoteStream: null,
        callDurationSeconds: 0,
        queueMetrics: { ...QUEUE_DEFAULTS },
        error: null
      };
    case ACTIONS.RESET_STATE:
      return { ...initialState };
    default:
      return state;
  }
}

export const AudioCallProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      actions: ACTIONS
    }),
    [state]
  );

  return <AudioCallContext.Provider value={value}>{children}</AudioCallContext.Provider>;
};

export const useAudioCallContext = () => {
  const context = useContext(AudioCallContext);

  if (!context) {
    throw new Error('useAudioCallContext must be used within an AudioCallProvider');
  }

  return context;
};

export { ACTIONS as AUDIO_CALL_ACTIONS };
