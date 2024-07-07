// Updated TextChatWithout component
import React, { useEffect, useRef, useState, useCallback } from 'react';
import FilterOptions from '@/components/chatComps/FilterOptions';
import styles from '../componentStyles/textchat.module.css';
import { initiateSocket } from '@/utils/ramdomchat/initiateSocket';
import { handleSend, handleTyping, handleStoppedTyping, handleFindNew, stopFindingPair, handleFindNewWhenSomeoneLeft } from '@/utils/ramdomchat/socketFunctions';
import CustomSnackbar from '../commonComps/Snackbar';
import InputBox from '../chatComps/InputBox';
import MessageDisplay from '../chatComps/MessagesDisplay';
import EventsContainer from '../chatComps/EventsContainer';
import { useTextChat, TextChatProvider } from '@/context/TextChatContext';
import { useFilters, FiltersProvider } from '@/context/FiltersContext';
import TimerPopup from '@/components/chatComps/TimerPopup';

const TextChatWithout = ({ userDetails }) => {
  const [textValue, setTextValue] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('');
  const [inpFocus, setInpFocus] = useState(false);
  const [isChatAvailable, setIsChatAvailable] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const findingTimeoutRef = useRef(null);

  // using textchat contexts
  const {
    socket, setSocket,
    isFindingPair, setIsFindingPair,
    strangerDisconnectedMessageDiv, setStrangerDisconnectedMessageDiv,
    room, setRoom,
    receiver, setReceiver,
    strangerGender, setStrangerGender,
    hasPaired, setHasPaired,
    strangerIsTyping, setStrangerIsTyping,
    usersOnline, setUsersOnline,
    messages, setMessages
  } = useTextChat()

  // using filters contexts
  const { preferredCollege, preferredGender } = useFilters();

  // Check if the current time is between 10 PM and 11 PM
  useEffect(() => {
    const checkChatAvailability = () => {
      const now = new Date();
      const start = new Date();
      start.setHours(22, 0, 0, 0); // 10 PM today
      const end = new Date(start);
      end.setHours(23, 0, 0, 0); // 11 PM today

      if (now >= start && now < end) {
        setIsChatAvailable(true);
      } else {
        setIsChatAvailable(false);
      }
    };

    checkChatAvailability();
    const interval = setInterval(checkChatAvailability, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isChatAvailable) {
      initiateSocket(socket, { userDetails, preferredCollege, preferredGender }, hasPaired, { room, setSocket, setUsersOnline, setStrangerIsTyping, setStrangerDisconnectedMessageDiv, setIsFindingPair, setRoom, setReceiver, setStrangerGender, setSnackbarColor, setSnackbarMessage, setSnackbarOpen, setHasPaired, setMessages }, { messagesContainerRef, findingTimeoutRef });
    } else if (socket) {
      socket.disconnect();
    }
  }, [isChatAvailable]);

  const handleSendButton = () => {
    handleSend(socket, textValue, { setTextValue, setMessages, setStrangerIsTyping }, messagesContainerRef, userDetails, hasPaired)
  }

  const handleFindNewButton = () => {
    if (socket) {
      if (!isFindingPair) {
        if (strangerDisconnectedMessageDiv && !hasPaired) {
          handleFindNewWhenSomeoneLeft(socket, { userDetails, preferredCollege, preferredGender }, { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages, }, hasPaired, findingTimeoutRef)
        } else {
          handleFindNew(socket, { userDetails, preferredCollege, preferredGender }, { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages, }, hasPaired, findingTimeoutRef)
        }
      } else {
        // stopFindingPair(socket, { setIsFindingPair })
      }
    } else {
      initiateSocket(socket, { userDetails, preferredCollege, preferredGender }, hasPaired, { room, setSocket, setUsersOnline, setStrangerIsTyping, setStrangerDisconnectedMessageDiv, setIsFindingPair, setRoom, setReceiver, setStrangerGender, setSnackbarColor, setSnackbarMessage, setSnackbarOpen, setHasPaired, setMessages }, { messagesContainerRef, findingTimeoutRef })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendButton();
    } else {
      handleTyping(e, socket, typingTimeoutRef, userDetails, hasPaired);
    }
  }

  return (
    <div className={styles.mainC}>
      {!isChatAvailable && <TimerPopup open={!isChatAvailable} />}
      {isChatAvailable && (
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
            handleStoppedTyping={handleStoppedTyping}
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

const TextChat = ({ userDetails }) => (
  <FiltersProvider>
    <TextChatProvider>
      <TextChatWithout userDetails={userDetails} />
    </TextChatProvider>
  </FiltersProvider>
);

export default TextChat;
