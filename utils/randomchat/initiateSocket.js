// utils/randomchat/initiateSocket.js
import { io } from 'socket.io-client';
import {
  handleIdentify,
  handlePairDisconnected,
  handlePairingSuccess,
  handleReceivedMessage
} from "@/utils/randomchat/socketFunctions";
import { devLogger } from './developmentLogger';

const serverUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:1000';

export const initiateSocket = (socket, userDetailsAndPreferences, hasPaired, stateFunctions, refs) => {
  const {
    room,
    setSocket,
    setUsersOnline,
    setStrangerIsTyping,
    setStrangerDisconnectedMessageDiv,
    setIsFindingPair,
    setRoom,
    setReceiver,
    setStrangerGender,
    setHasPaired,
    setMessages,
    setIsStrangerVerified,
    setQueuePosition,
    setWaitTime,
    setFilterLevel,
    setFilterDescription,
    setEstimatedWaitTime,
    setQueueSize,
    setPairingState,
    setMatchQuality
  } = stateFunctions;

  const { messagesContainerRef, findingTimeoutRef } = refs;
  let newSocket;

  try {
    if (!socket) {
      newSocket = io(serverUrl, { query: { pageType: 'textchat' } });
      setSocket(newSocket);

      // Register event listeners ONCE (not inside connect handler to avoid duplicates)
      newSocket.on('roundedUsersCount', (data) => {
        // Handle both old format (number) and new format (object)
        const count = typeof data === 'object' ? data.textChat : data;
        console.log('[Socket] Received roundedUsersCount:', data, '-> textChat count:', count);
        setUsersOnline(count || 0);
      });

      newSocket.on('identify', () => {
        handleIdentify(newSocket, userDetailsAndPreferences, stateFunctions, findingTimeoutRef);
      });

      newSocket.on('pairingSuccess', (data) => {
        handlePairingSuccess(data, hasPaired, stateFunctions, findingTimeoutRef);
      });

      // CRITICAL: Message listener registered ONCE to prevent duplicate messages
      newSocket.on('message', (data) => {
        handleReceivedMessage(data, stateFunctions, messagesContainerRef);
      });

      newSocket.on('userTyping', () => {
        setStrangerIsTyping(true);
      });

      newSocket.on('userStoppedTyping', () => {
        setStrangerIsTyping(false);
      });

      newSocket.on('pairDisconnected', () => {
        handlePairDisconnected(stateFunctions, messagesContainerRef);
      });

      newSocket.on('connect', () => {
        // console.log('[Socket] Connected to server');
        // Only send identify on connect
        handleIdentify(newSocket, userDetailsAndPreferences, stateFunctions, findingTimeoutRef);
      });

      // Enhanced Pairing Manager events
      newSocket.on('queueStatus', (data) => {
        devLogger.queueStatus(data);
        setQueuePosition(data.position);
        setWaitTime(Math.floor(data.waitTime / 1000));
        setFilterLevel(data.filterLevel);
        setEstimatedWaitTime(Math.floor(data.estimatedWait / 1000));
        setQueueSize(data.queueSize);
        setFilterDescription(data.filterDescription);
        setPairingState('WAITING');
      });

      newSocket.on('filterLevelChanged', (data) => {
        devLogger.filterLevelChange(data);
        setFilterLevel(data.newLevel);
        setFilterDescription(data.newDescription);
        // Filter level changes are now shown in PairingStatusDisplay
      });

      newSocket.on('pairingAttempt', (data) => {
        devLogger.pairing('Pairing attempt', data);
        // Optional: Add subtle UI feedback for pairing attempts
      });

      // Queue joined acknowledgment (clears safety timeout)
      newSocket.on('queueJoined', (data) => {
        devLogger.success('Queue joined confirmation', data);
        // console.log('[initiateSocket] Successfully joined queue:', data);
        clearTimeout(findingTimeoutRef?.current);
        setPairingState('WAITING');
        setIsFindingPair(true); // Ensure finding state is set
      });

      newSocket.on('noUsersAvailable', (data) => {
        devLogger.warning('No users available', data);
        // Level 4 - keep waiting, don't stop finding
        if (data.keepWaiting) {
          // console.log('[initiateSocket] No users available - keep waiting');
          setPairingState('WAITING');
          // Don't set setIsFindingPair(false) - keep searching
        } else {
          setPairingState('IDLE');
          setIsFindingPair(false);
        }
      });

      // Queue timeout (15 minutes exceeded)
      newSocket.on('queueTimeout', (data) => {
        devLogger.error('Queue timeout exceeded', data);
        console.error('[initiateSocket] Max wait time exceeded:', data);
        setPairingState('IDLE');
        setIsFindingPair(false);
        clearTimeout(findingTimeoutRef?.current);
        // Show notification to user
        alert(data.message + '\n' + data.suggestion);
      });

      // Filter update responses
      newSocket.on('filtersUpdated', (data) => {
        devLogger.success('Filters updated', data);
        // console.log('[initiateSocket] Received filtersUpdated:', data);
      });

      newSocket.on('filtersUpdateFailed', (data) => {
        devLogger.error('Filter update failed', data);
        console.error('[initiateSocket] Received filtersUpdateFailed:', data);
      });

      newSocket.on('disconnect', () => {
        // console.log('[Socket] Disconnected from server');
        setSocket(null);
        setPairingState('IDLE');
      });
    }
  } catch (error) {
    console.error('Error initiating socket:', error);
  }
};
