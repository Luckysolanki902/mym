import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAudioCallContext } from '@/context/AudioCallContext';
import {
  CALL_STATUS,
  PAIRING_STATE,
  SOCKET_EVENTS,
  HEARTBEAT_INTERVAL_MS,
  CALL_TIMER_INTERVAL_MS,
  DEFAULT_CALL_DESCRIPTION
} from '@/utils/audioCall/constants';
import { usePeerConnection } from './usePeerConnection';
import { useAudioDialerSounds } from './useAudioDialerSounds';
import { createAudioSocket } from '@/utils/audioCall/initiateAudioSocket';

const DEBUG_PREFIX = '[AudioCallLifecycle]';

const buildIdentifyPayload = (user, filters) => ({
  userMID: user?.mid,
  userGender: user?.gender,
  userCollege: user?.college,
  preferredGender: filters?.preferredGender ?? 'any',
  preferredCollege: filters?.preferredCollege ?? 'any',
  isVerified: user?.isVerified || false,
  pageType: 'audiocall'
});

const debugLog = (...args) => {
  // eslint-disable-next-line no-console
  console.log(DEBUG_PREFIX, ...args);
};

export const useAudioCallLifecycle = ({ userDetails, filters }) => {
  const { state, dispatch, actions } = useAudioCallContext();

  const heartbeatRef = useRef(null);
  const callTimerRef = useRef(null);
  const socketRef = useRef(null);
  const queueMetricsRef = useRef(state.queueMetrics);
  const userRef = useRef(state.user);
  const userDetailsRef = useRef(userDetails);
  const filtersRef = useRef({
    preferredGender: filters?.preferredGender ?? 'any',
    preferredCollege: filters?.preferredCollege ?? 'any'
  });

  const sounds = useAudioDialerSounds();

  const { initiateCall, hangUp, setMuted, ensureLocalStream } = usePeerConnection({
    onCallStarted: () => {
      debugLog('Peer connection established');
      dispatch({ type: actions.SET_PAIRING_STATE, payload: PAIRING_STATE.CONNECTED });
      sounds.stopRingback();
      sounds.playConnected();
    },
    onCallEnded: () => {
      debugLog('Peer connection ended');
      sounds.playEnded();
    },
    onError: (error) => {
      debugLog('Peer connection error', error);
      dispatch({ type: actions.SET_ERROR, payload: error?.message || 'Call error' });
    }
  });

  useEffect(() => {
    queueMetricsRef.current = state.queueMetrics;
  }, [state.queueMetrics]);

  useEffect(() => {
    userRef.current = state.user;
  }, [state.user]);

  useEffect(() => {
    userDetailsRef.current = userDetails;
  }, [userDetails]);

  useEffect(() => {
    filtersRef.current = {
      preferredGender: filters?.preferredGender ?? 'any',
      preferredCollege: filters?.preferredCollege ?? 'any'
    };
  }, [filters?.preferredGender, filters?.preferredCollege]);

  const emitIdentify = useCallback(() => {
    const latestUser = userDetailsRef.current;
    if (!socketRef.current || !latestUser?.mid) {
      debugLog('emitIdentify aborted - missing socket or user', {
        hasSocket: Boolean(socketRef.current),
        userMidPresent: Boolean(latestUser?.mid)
      });
      return;
    }

    const payload = buildIdentifyPayload(latestUser, filtersRef.current);
    debugLog('Emitting identify', payload);
    dispatch({ type: actions.SET_PAIRING_STATE, payload: PAIRING_STATE.FINDING });
    dispatch({ type: actions.SET_USER, payload: latestUser });
    dispatch({ type: actions.SET_CALL_STATUS, payload: CALL_STATUS.WAITING_FOR_PEER });
    dispatch({ type: actions.SET_ERROR, payload: null });
    socketRef.current.emit('identify', payload);
  }, [actions, dispatch]);

  const handlePairingSuccess = useCallback(
    (payload) => {
      debugLog('Received pairingSuccess', payload);
      dispatch({ type: actions.SET_PAIRING_STATE, payload: PAIRING_STATE.MATCHED });
      dispatch({ type: actions.SET_CALL_CONTEXT, payload: payload?.callContext || null });
      dispatch({
        type: actions.SET_PARTNER,
        payload: {
          mid: payload?.stranger,
          gender: payload?.strangerGender,
          verified: payload?.isStrangerVerified,
          matchQuality: payload?.matchQuality
        }
      });
      dispatch({ type: actions.SET_CALL_STATUS, payload: CALL_STATUS.WAITING_FOR_PEER });
    },
    [actions.SET_CALL_CONTEXT, actions.SET_CALL_STATUS, actions.SET_PAIRING_STATE, actions.SET_PARTNER, dispatch]
  );

  const handleCallReady = useCallback(
    async (payload) => {
      debugLog('Received callReady', payload);
      dispatch({ type: actions.SET_CALL_READY, payload });
      dispatch({ type: actions.SET_CALL_STATUS, payload: CALL_STATUS.READY });
      dispatch({ type: actions.SET_PAIRING_STATE, payload: PAIRING_STATE.RINGING });

      if (payload?.role === 'initiator') {
        try {
          sounds.playRingback();
          await ensureLocalStream();
          await initiateCall(payload.partnerPeerId);
        } catch (error) {
          debugLog('Failed to start call as initiator', error);
          dispatch({ type: actions.SET_ERROR, payload: error?.message || 'Failed to start call' });
          sounds.stopRingback();
        }
      }
    },
    [actions.SET_CALL_READY, actions.SET_CALL_STATUS, actions.SET_PAIRING_STATE, dispatch, ensureLocalStream, initiateCall, sounds]
  );

  const handleCallEnded = useCallback(
    (data) => {
      debugLog('Received callEnded', data);
      hangUp(data?.reason || 'peer-ended');
      dispatch({ type: actions.RESET_CALL });
      sounds.playEnded();
    },
    [actions.RESET_CALL, dispatch, hangUp, sounds]
  );

  const handlePairDisconnected = useCallback(() => {
    debugLog('Received pairDisconnected');
    dispatch({ type: actions.SET_PAIRING_STATE, payload: PAIRING_STATE.ENDED });
    dispatch({ type: actions.SET_CALL_STATUS, payload: CALL_STATUS.ENDED });
    dispatch({ type: actions.SET_REMOTE_STREAM, payload: null });
    sounds.stopRingback();
    sounds.playEnded();
  }, [actions.SET_CALL_STATUS, actions.SET_PAIRING_STATE, actions.SET_REMOTE_STREAM, dispatch, sounds]);

  const handleQueueStatus = useCallback(
    (data) => {
      debugLog('Received queueStatus', data);
      dispatch({
        type: actions.SET_QUEUE_METRICS,
        payload: {
          position: data?.position,
          waitTime: data?.waitTime,
          estimatedWait: data?.estimatedWait,
          filterLevel: data?.filterLevel,
          filterDescription: data?.filterDescription,
          queueSize: data?.queueSize
        }
      });
      dispatch({ type: actions.SET_PAIRING_STATE, payload: PAIRING_STATE.WAITING });
    },
    [actions.SET_PAIRING_STATE, actions.SET_QUEUE_METRICS, dispatch]
  );

  const handleQueueJoined = useCallback(
    (data = {}) => {
      debugLog('Received queueJoined', data);
      dispatch({
        type: actions.SET_QUEUE_METRICS,
        payload: {
          position: data?.position || 0,
          queueSize: data?.queueSize || 0,
          filterDescription: data?.message || DEFAULT_CALL_DESCRIPTION
        }
      });
      dispatch({ type: actions.SET_PAIRING_STATE, payload: PAIRING_STATE.WAITING });
      dispatch({ type: actions.SET_CALL_STATUS, payload: CALL_STATUS.WAITING_FOR_PEER });
      dispatch({ type: actions.SET_ERROR, payload: null });
    },
    [actions.SET_CALL_STATUS, actions.SET_ERROR, actions.SET_PAIRING_STATE, actions.SET_QUEUE_METRICS, dispatch]
  );

  const handlePairingAttempt = useCallback(
    (data = {}) => {
      debugLog('Received pairingAttempt', data);
      dispatch({
        type: actions.SET_QUEUE_METRICS,
        payload: {
          filterLevel: data?.filterLevel,
          lastAttempt: {
            attempt: data?.attempt,
            timestamp: Date.now()
          }
        }
      });
    },
    [actions.SET_QUEUE_METRICS, dispatch]
  );

  const handleNoUsersAvailable = useCallback(
    (data = {}) => {
      debugLog('Received noUsersAvailable', data);
      const currentMetrics = queueMetricsRef.current;
      dispatch({ type: actions.SET_PAIRING_STATE, payload: PAIRING_STATE.WAITING });
      dispatch({
        type: actions.SET_QUEUE_METRICS,
        payload: {
          filterDescription: data?.suggestion || data?.message || DEFAULT_CALL_DESCRIPTION,
          queueSize: data?.onlineUsers?.inQueue ?? currentMetrics.queueSize,
          waitTime: data?.waitTime ?? currentMetrics.waitTime
        }
      });
    },
    [actions.SET_PAIRING_STATE, actions.SET_QUEUE_METRICS, dispatch]
  );

  const handleQueueTimeout = useCallback(
    (data = {}) => {
      debugLog('Received queueTimeout', data);
      sounds.stopRingback();
      dispatch({ type: actions.RESET_CALL });
      dispatch({
        type: actions.SET_ERROR,
        payload: data?.message || 'Queue wait limit reached. Please try again later.'
      });
    },
    [actions.RESET_CALL, actions.SET_ERROR, dispatch, sounds]
  );

  const handleFiltersUpdated = useCallback(
    (data = {}) => {
      debugLog('Received filtersUpdated', data);
      const currentMetrics = queueMetricsRef.current;
      dispatch({
        type: actions.SET_QUEUE_METRICS,
        payload: {
          position: data?.position ?? currentMetrics.position,
          waitTime: data?.waitTime ?? currentMetrics.waitTime
        }
      });
      dispatch({ type: actions.SET_ERROR, payload: null });
    },
    [actions.SET_ERROR, actions.SET_QUEUE_METRICS, dispatch]
  );

  const handleFiltersUpdateFailed = useCallback(
    (data = {}) => {
      debugLog('Received filtersUpdateFailed', data);
      dispatch({
        type: actions.SET_ERROR,
        payload: data?.message || 'Unable to update filters right now.'
      });
    },
    [actions.SET_ERROR, dispatch]
  );

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    const userMID = userRef.current?.mid;
    if (!socketRef.current || !userMID) {
      debugLog('Heartbeat not started - missing socket or user', {
        hasSocket: Boolean(socketRef.current),
        userMID
      });
      return;
    }

    heartbeatRef.current = setInterval(() => {
      const latestMID = userRef.current?.mid;
      if (socketRef.current && latestMID) {
        socketRef.current.emit('callHeartbeat', { userMID: latestMID });
      }
    }, HEARTBEAT_INTERVAL_MS);
  }, [stopHeartbeat]);

  const stopTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    let seconds = 0;
    dispatch({ type: actions.SET_CALL_DURATION, payload: seconds });
    callTimerRef.current = setInterval(() => {
      seconds += 1;
      dispatch({ type: actions.SET_CALL_DURATION, payload: seconds });
    }, CALL_TIMER_INTERVAL_MS);
  }, [actions.SET_CALL_DURATION, dispatch, stopTimer]);

  useEffect(() => {
    if (state.callStatus === CALL_STATUS.ACTIVE) {
      debugLog('Call status ACTIVE - starting heartbeat & timer');
      startHeartbeat();
      startTimer();
    } else {
      stopHeartbeat();
      stopTimer();
    }

    return () => {
      stopHeartbeat();
      stopTimer();
    };
  }, [startHeartbeat, startTimer, state.callStatus, stopHeartbeat, stopTimer]);

  useEffect(() => {
    const latestUser = userDetailsRef.current;
    if (!latestUser?.mid) {
      debugLog('Socket setup skipped - missing user mid');
      return;
    }

    if (socketRef.current) {
      return;
    }

    const socket = createAudioSocket();
    if (!socket) {
      debugLog('Socket creation aborted - returned null (likely SSR)');
      return undefined;
    }

    socketRef.current = socket;
    dispatch({ type: actions.SET_SOCKET, payload: socket });
    debugLog('Socket created', { socketId: socket.id });

    const handleConnect = () => {
      debugLog('Socket connected', { socketId: socket.id });
      emitIdentify();
    };

    socket.on('connect', handleConnect);
    socket.on('identify', emitIdentify);
    socket.on(SOCKET_EVENTS.PAIRING_SUCCESS, handlePairingSuccess);
    socket.on(SOCKET_EVENTS.CALL_READY, handleCallReady);
    socket.on(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);
    socket.on(SOCKET_EVENTS.PAIR_DISCONNECTED, handlePairDisconnected);
    socket.on(SOCKET_EVENTS.QUEUE_STATUS, handleQueueStatus);
    socket.on(SOCKET_EVENTS.FILTER_LEVEL_CHANGED, (data) => {
      debugLog('Received filterLevelChanged', data);
      dispatch({
        type: actions.SET_QUEUE_METRICS,
        payload: {
          filterLevel: data?.newLevel,
          filterDescription: data?.newDescription
        }
      });
    });
    socket.on(SOCKET_EVENTS.PARTNER_STATUS, (payload) => {
      debugLog('Received partnerStatus', payload);
      if (payload?.status === CALL_STATUS.ENDED) {
        handleCallEnded({ reason: 'partner-ended' });
      }
    });
    socket.on('queueJoined', handleQueueJoined);
    socket.on('pairingAttempt', handlePairingAttempt);
    socket.on('noUsersAvailable', handleNoUsersAvailable);
    socket.on('queueTimeout', handleQueueTimeout);
    socket.on('filtersUpdated', handleFiltersUpdated);
    socket.on('filtersUpdateFailed', handleFiltersUpdateFailed);
    socket.on('connect_error', (error) => {
      debugLog('connect_error', error);
      dispatch({ type: actions.SET_ERROR, payload: error?.message || 'Unable to connect to server' });
    });

    return () => {
      debugLog('Tearing down socket listeners');
      socket.off('connect', handleConnect);
      socket.off('identify', emitIdentify);
      socket.off(SOCKET_EVENTS.PAIRING_SUCCESS, handlePairingSuccess);
      socket.off(SOCKET_EVENTS.CALL_READY, handleCallReady);
      socket.off(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);
      socket.off(SOCKET_EVENTS.PAIR_DISCONNECTED, handlePairDisconnected);
      socket.off(SOCKET_EVENTS.QUEUE_STATUS, handleQueueStatus);
      socket.off(SOCKET_EVENTS.FILTER_LEVEL_CHANGED);
      socket.off(SOCKET_EVENTS.PARTNER_STATUS);
      socket.off('queueJoined', handleQueueJoined);
      socket.off('pairingAttempt', handlePairingAttempt);
      socket.off('noUsersAvailable', handleNoUsersAvailable);
      socket.off('queueTimeout', handleQueueTimeout);
      socket.off('filtersUpdated', handleFiltersUpdated);
      socket.off('filtersUpdateFailed', handleFiltersUpdateFailed);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      dispatch({ type: actions.SET_SOCKET, payload: null });
    };
  }, [actions.SET_QUEUE_METRICS, actions.SET_SOCKET, dispatch, emitIdentify, handleCallEnded, handleCallReady, handleFiltersUpdateFailed, handleFiltersUpdated, handlePairDisconnected, handlePairingAttempt, handlePairingSuccess, handleQueueJoined, handleQueueStatus, handleNoUsersAvailable, handleQueueTimeout, userDetails?.mid]);

  const requestFindNew = useCallback(
    (reason = 'user-request') => {
      const userMID = userRef.current?.mid;
      if (!socketRef.current || !userMID) {
        debugLog('requestFindNew aborted - missing socket or user', {
          hasSocket: Boolean(socketRef.current),
          userMID
        });
        return;
      }

      const payload = buildIdentifyPayload(userDetailsRef.current, filtersRef.current);
      const event = reason === 'partner-left' ? 'findNewPairWhenSomeoneLeft' : 'findNewPair';
      debugLog('Emitting find-new request', { event, payload });
      socketRef.current.emit(event, payload);
      dispatch({ type: actions.RESET_CALL });
      dispatch({ type: actions.SET_PAIRING_STATE, payload: PAIRING_STATE.FINDING });
      dispatch({ type: actions.SET_CALL_STATUS, payload: CALL_STATUS.WAITING_FOR_PEER });
      sounds.stopRingback();
    },
    [actions.RESET_CALL, actions.SET_CALL_STATUS, actions.SET_PAIRING_STATE, dispatch, sounds]
  );

  const stopFinding = useCallback(() => {
    const userMID = userRef.current?.mid;
    if (!socketRef.current || !userMID) {
      debugLog('stopFinding aborted - missing socket or user', {
        hasSocket: Boolean(socketRef.current),
        userMID
      });
      return;
    }
    debugLog('Emitting stopFindingPair', { userMID });
    socketRef.current.emit('stopFindingPair', { userMID });
    dispatch({ type: actions.SET_PAIRING_STATE, payload: PAIRING_STATE.IDLE });
    dispatch({
      type: actions.SET_QUEUE_METRICS,
      payload: {
        position: 0,
        waitTime: 0,
        estimatedWait: 0,
        filterLevel: 1,
        filterDescription: DEFAULT_CALL_DESCRIPTION,
        queueSize: 0
      }
    });
    sounds.stopRingback();
  }, [actions.SET_PAIRING_STATE, actions.SET_QUEUE_METRICS, dispatch, sounds]);

  useEffect(
    () => () => {
      debugLog('Unmounting lifecycle hook');
      hangUp('page-leave');
      stopHeartbeat();
      stopTimer();
      sounds.stopRingback();
    },
    [hangUp, sounds, stopHeartbeat, stopTimer]
  );

  return useMemo(
    () => ({
      initiate: emitIdentify,
      requestFindNew,
      stopFinding,
      hangUp,
      setMuted,
      ensureLocalStream,
      soundsEnabled: sounds.soundsEnabled,
      setSoundsEnabled: sounds.setSoundsEnabled
    }),
    [emitIdentify, ensureLocalStream, hangUp, requestFindNew, setMuted, sounds.setSoundsEnabled, sounds.soundsEnabled, stopFinding]
  );
};

