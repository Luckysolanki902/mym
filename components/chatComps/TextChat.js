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
import { useTextChat } from '@/context/TextChatContext';
import { useFilters } from '@/context/FiltersContext';
import TimerPopup from '@/components/chatComps/TimerPopup';
import { useSelector } from 'react-redux';

const TextChat = ({ userDetails }) => {
  const [textValue, setTextValue] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('');
  const [inpFocus, setInpFocus] = useState(false);
  const [isChatAvailable, setIsChatAvailable] = useState(true); // Set to true if no time restrictions
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false); // Initialize isTypingRef
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const findingTimeoutRef = useRef(null);

  // Using textchat contexts
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
    isStrangerVerified, setIsStrangerVerified
  } = useTextChat();

  // Using filters contexts
  const { preferredCollege, preferredGender } = useFilters();

  // Check if the current time is between 10 PM and 11 PM (if required)

//   useEffect(() => {
//     const checkChatAvailability = () => {
//       const now = new Date();
//       const start = new Date();
//       start.setHours(22, 0, 0, 0); // 10 PM today
//       const end = new Date(start);
//       end.setHours(23, 59, 0, 0); // 11 PM today

//       if (now >= start && now < end) {
//         setIsChatAvailable(true);
//       } else {
//         setIsChatAvailable(false);
//       }
//     };

//     // Uncomment below if you want time-based restrictions
//     /*
//     checkChatAvailability();
//     const interval = setInterval(checkChatAvailability, 60000); // Check every minute
//     return () => clearInterval(interval);
//     */
    
//     // If you don't want time-based restrictions, ensure isChatAvailable is true
//     setIsChatAvailable(true);
//   }, []);

  useEffect(() => {
    const initiate = async () => {
      // Ensure all required userDetails fields are present
      if (!userDetails || !userDetails.gender || !userDetails.college || !userDetails.mid) return;

      if (isChatAvailable && !socket) {
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
            setIsStrangerVerified
          },
          { messagesContainerRef, findingTimeoutRef }
        );
      } else if (socket && !hasPaired && !receiver) {
        handleFindNew(
          socket,
          { userDetails, preferredCollege, preferredGender },
          { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages, setIsStrangerVerified },
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
    socket,
    userDetails,
    preferredCollege,
    preferredGender,
    hasPaired,
    receiver,
  ]);

  const handleSendButton = () => {
    handleSend(
      socket,
      textValue,
      { setTextValue, setMessages, setStrangerIsTyping },
      messagesContainerRef,
      userDetails,
      hasPaired
    );
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
      // Socket is not initialized, perhaps show a message or initiate the socket
      // But since TextChat is only rendered when userDetails are complete, this should not happen
      console.warn("Socket not initialized yet.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && hasPaired) {
      e.preventDefault();
      handleSendButton();
    } else {
      handleTyping(e, socket, typingTimeoutRef, userDetails, hasPaired, isTypingRef);
    }
  };

  return (
    <div className={styles.mainC}>
      {/* Remove the TimerPopup if chat is always available, or adjust logic accordingly */}
      {/* {!isChatAvailable && <TimerPopup open={!isChatAvailable} />} */}
      {(isChatAvailable && userDetails) && (
        <>
          <MessageDisplay userDetails={userDetails} isStrangerVerified={isStrangerVerified}/>
          <InputBox
            handleFindNewButton={handleFindNewButton}
            handleSendButton={handleSendButton}
            textValue={textValue}
            setTextValue={setTextValue}
            inpFocus={inpFocus}
            setInpFocus={setInpFocus}
            handleKeyDown={handleKeyDown}
            handleStoppedTyping={() =>
              handleStoppedTyping(socket, typingTimeoutRef, userDetails, hasPaired, isTypingRef)
            }
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
      {/* {!isChatAvailable && (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
          <Typography variant="h5" gutterBottom>
            Chat is currently unavailable. Please try again later.
          </Typography>
        </Box>
      )} */}
    </div>
  );
};

export default TextChat;
