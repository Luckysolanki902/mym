// utils/randomchat/initiateSocket.js
import { io } from 'socket.io-client';
import {
  handleIdentify,
  handlePairDisconnected,
  handlePairingSuccess,
  handleReceivedMessage
} from "@/utils/randomchat/socketFunctions";

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
    setSnackbarColor,
    setSnackbarMessage,
    setSnackbarOpen,
    setHasPaired,
    setMessages,
    setIsStrangerVerified
  } = stateFunctions;

  const { messagesContainerRef, findingTimeoutRef } = refs;
  let newSocket;

  try {
    if (!socket) {
      newSocket = io(serverUrl, { query: { pageType: 'textchat' } });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        // Sending user preferences to server
        handleIdentify(newSocket, userDetailsAndPreferences, stateFunctions, findingTimeoutRef);

        // Handling various socket events
        newSocket.on('roundedUsersCount', (count) => {
          setUsersOnline(count);
        });

        newSocket.on('identify', () => {
          handleIdentify(newSocket, userDetailsAndPreferences, stateFunctions, findingTimeoutRef);
        });

        newSocket.on('pairingSuccess', (data) => {
          handlePairingSuccess(data, hasPaired, stateFunctions, findingTimeoutRef);
        });

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

        newSocket.on('disconnect', () => {
          setSocket(null);
        });
      });
    }
  } catch (error) {
    console.error('Error initiating socket:', error);
  }
};
