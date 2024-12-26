// components/chatComps/TextChat.js
import React, { useEffect, useRef, useState } from 'react';
import FilterOptions from '@/components/chatComps/FilterOptions';
import styles from '../componentStyles/textchat.module.css';
import { initiateSocket } from '@/utils/randomchat/initiateSocket';
import {
  handleSend,
  handleTyping,
  handleStoppedTyping,
  handleFindNew,
  handleFindNewWhenSomeoneLeft,
} from '@/utils/randomchat/socketFunctions';
import CustomSnackbar from '../commonComps/Snackbar';
import InputBox from '../chatComps/InputBox';
import MessageDisplay from '../chatComps/MessagesDisplay';
import { useTextChat, TextChatProvider } from '@/context/TextChatContext';
import { useFilters, FiltersProvider } from '@/context/FiltersContext';
import TimerPopup from '@/components/chatComps/TimerPopup';
import { useSelector } from 'react-redux';

const TextChat = ({ userDetails }) => {
  const [textValue, setTextValue] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('');
  const [inpFocus, setInpFocus] = useState(false);
  const [isChatAvailable, setIsChatAvailable] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false); // Initialize isTypingRef
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const findingTimeoutRef = useRef(null);
  const neverShowTimer = useRef(true);

  // using textchat contexts
  const {
    socket,
    setSocket,
    isFindingPair,
    setIsFindingPair,
    strangerDisconnectedMessageDiv,
    setStrangerDisconnectedMessageDiv,
    room,
    setRoom,
    receiver,
    setReceiver,
    strangerGender,
    setStrangerGender,
    hasPaired,
    setHasPaired,
    strangerIsTyping,
    setStrangerIsTyping,
    usersOnline,
    setUsersOnline,
    messages,
    setMessages,
  } = useTextChat();

  // using filters contexts
  const { preferredCollege, preferredGender } = useFilters();

  // Check if the current time is between 10 PM and 11 PM
  useEffect(() => {
    const checkChatAvailability = () => {
      const now = new Date();
      const start = new Date();
      start.setHours(22, 0, 0, 0); // 10 PM today
      const end = new Date(start);
      end.setHours(23, 59, 0, 0); // 11 PM today

      if (now >= start && now < end) {
        setIsChatAvailable(true);
      } else {
        setIsChatAvailable(false);
      }
    };

    if (!neverShowTimer.current) {
      checkChatAvailability();
      const interval = setInterval(checkChatAvailability, 1000);
      return () => clearInterval(interval);
    }
  }, [neverShowTimer.current]);

  useEffect(() => {
    const initiate = async () => {
      if (!userDetails) return;

      if ((isChatAvailable || neverShowTimer.current) && !socket) {
        initiateSocket(
          socket,
          { userDetails, preferredCollege, preferredGender },
          hasPaired,
          {
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
          },
          { messagesContainerRef, findingTimeoutRef }
        );
      } else if (socket && !hasPaired && !receiver) {
        handleFindNew(
          socket,
          { userDetails, preferredCollege, preferredGender },
          { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages },
          hasPaired,
          findingTimeoutRef
        );
      }

      // Cleanup on unmount
      return () => {
        clearTimeout(typingTimeoutRef.current);
      };
    };

    initiate();
  }, [
    isChatAvailable,
    neverShowTimer.current,
    socket,
    userDetails,
    preferredCollege,
    preferredGender,
    hasPaired,
    receiver,
  ]);

  const handleSendButton = () => {
    handleSend(socket, textValue, { setTextValue, setMessages, setStrangerIsTyping }, messagesContainerRef, userDetails, hasPaired);
  };

  const handleFindNewButton = () => {
    if (socket) {
      if (!isFindingPair) {
        if (strangerDisconnectedMessageDiv && !hasPaired) {
          handleFindNewWhenSomeoneLeft(
            socket,
            { userDetails, preferredCollege, preferredGender },
            { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages },
            hasPaired,
            findingTimeoutRef
          );
        } else {
          handleFindNew(
            socket,
            { userDetails, preferredCollege, preferredGender },
            { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages },
            hasPaired,
            findingTimeoutRef
          );
        }
      }
    } else {
      initiateSocket(
        socket,
        { userDetails, preferredCollege, preferredGender },
        hasPaired,
        {
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
        },
        { messagesContainerRef, findingTimeoutRef }
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && hasPaired) {
      e.preventDefault();
      handleSendButton();
    } else {
      handleTyping(e, socket, typingTimeoutRef, userDetails, hasPaired, isTypingRef); // Pass isTypingRef
    }
  };

  return (
    <div className={styles.mainC}>
      {!isChatAvailable && !neverShowTimer.current && <TimerPopup open={!isChatAvailable} />}
      {(isChatAvailable || neverShowTimer.current) && userDetails && (
        <>
          <MessageDisplay userDetails={userDetails} />
          <InputBox
            handleFindNewButton={handleFindNewButton}
            handleSendButton={handleSendButton}
            textValue={textValue}
            setTextValue={setTextValue}
            inpFocus={inpFocus}
            setInpFocus={setInpFocus}
            handleKeyDown={handleKeyDown}
            handleStoppedTyping={() => handleStoppedTyping(socket, typingTimeoutRef, userDetails, hasPaired, isTypingRef)} // Pass isTypingRef
            typingTimeoutRef={typingTimeoutRef}
            inputRef={inputRef}
            userDetails={userDetails}
          />
          <CustomSnackbar
            open={snackbarOpen}
            onClose={() => setSnackbarOpen(false)}
            message={snackbarMessage}
            color={snackbarColor}
          />
        </>
      )}
    </div>
  );
};

export default TextChat;
