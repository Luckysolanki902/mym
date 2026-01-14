// components/chatComps/TextChat.js
import React, { useEffect, useRef, useState } from 'react';
import styles from '../componentStyles/textchat.module.css';
import { initiateSocket } from '@/utils/randomchat/initiateSocket';
import {
  handleSend,
  handleTyping,
  handleStoppedTyping,
  handleFindNew,
  handleFindNewWhenSomeoneLeft,
} from '@/utils/randomchat/socketFunctions';
import InputBox from '../chatComps/InputBox';
import MessageDisplay from '../chatComps/MessagesDisplay';
import { useTextChat } from '@/context/TextChatContext';
import { useFilters } from '@/context/FiltersContext';
import { useSelector, useDispatch } from 'react-redux';
import OnboardingTour from '../commonComps/OnboardingTour';
import { textChatTourSteps } from '@/config/tourSteps';
import { startTour, selectIsTourCompleted } from '@/store/slices/onboardingSlice';

const TextChat = ({ userDetails }) => {
  const [textValue, setTextValue] = useState('');
  const [inpFocus, setInpFocus] = useState(false);
  const [isChatAvailable, setIsChatAvailable] = useState(true); // Set to true if no time restrictions
  const [onlineCount, setOnlineCount] = useState(0);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false); // Initialize isTypingRef
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const findingTimeoutRef = useRef(null);
  const filterOpenRef = useRef(null);
  const socketInitRef = useRef(false); // Prevent double initialization in StrictMode
  const socketRef = useRef(null); // For cleanup without dependency issues

  // Redux for onboarding tour
  const dispatch = useDispatch();
  const isTextChatTourCompleted = useSelector(selectIsTourCompleted('textChat'));

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
    isStrangerVerified,
    setIsStrangerVerified,
    queuePosition,
    setQueuePosition,
    waitTime,
    setWaitTime,
    filterLevel,
    setFilterLevel,
    filterDescription,
    setFilterDescription,
    estimatedWaitTime,
    setEstimatedWaitTime,
    queueSize,
    setQueueSize,
    pairingState,
    setPairingState,
    matchQuality,
    setMatchQuality
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
    // Ensure all required userDetails fields are present
    if (!userDetails || !userDetails.gender || !userDetails.college || !userDetails.mid) return;

    // Prevent double initialization in React StrictMode
    if (socketInitRef.current || socket) return;
    socketInitRef.current = true;

    if (isChatAvailable) {
      initiateSocket(
        null, // Always pass null, we check socketInitRef instead
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
        },
        { messagesContainerRef, findingTimeoutRef }
      );
    }

    // Cleanup on unmount
    return () => {
      clearTimeout(typingTimeoutRef.current);
      socketInitRef.current = false;
    };
  }, [
    isChatAvailable,
    userDetails?.mid,  // Only track user ID, not entire object
  ]);

  // Auto-start finding when socket connects (after initialization)
  useEffect(() => {
    // Wait for socket to be ready and not already paired/finding
    if (socket?.connected && !hasPaired && !isFindingPair && !strangerDisconnectedMessageDiv) {
      // Small delay to ensure UI is ready
      const autoStartTimer = setTimeout(() => {
        console.log('[TextChat] Auto-starting pair finding after socket connection');
        handleFindNewButton();
      }, 500);
      
      return () => clearTimeout(autoStartTimer);
    }
  }, [socket?.connected, hasPaired, isFindingPair, strangerDisconnectedMessageDiv]);

  // Store socket in ref for cleanup to avoid dependency issues
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Cleanup socket ONLY on component unmount (empty deps)
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log('[TextChat] Unmounting - disconnecting socket');
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty deps = only runs on unmount

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

  // Safety: Reset stuck state on mount
  useEffect(() => {
    // If we're in "finding" state but socket doesn't exist, reset
    if (isFindingPair && !socket) {
      setIsFindingPair(false);
      setPairingState && setPairingState('IDLE');
    }
  }, [isFindingPair, socket, setIsFindingPair, setPairingState]);

  const handleFindNewButton = () => {
    // Edge Case 1: No user details
    if (!userDetails || !userDetails.mid || !userDetails.gender || !userDetails.college) {
      console.error('[FindNew] Missing user details');
      alert('Please refresh the page - user information missing');
      return;
    }

    // Edge Case 2: Socket not initialized or disconnected
    if (!socket || !socket.connected) {
      // Force reconnect
      if (socket) {
        socket.disconnect();
      }
      
      // Reset state and reinitialize
      setIsFindingPair(false);
      setHasPaired(false);
      setStrangerDisconnectedMessageDiv(false);
      setPairingState && setPairingState('IDLE');
      
      // Trigger re-initialization by clearing socket
      setSocket(null);
      
      // Show feedback to user
      setTimeout(() => {
        alert('Connection reset. Please click Find New again.');
      }, 500);
      
      return;
    }

    // Edge Case 3: Already finding - prevent spam clicks
    if (isFindingPair && !hasPaired && !strangerDisconnectedMessageDiv) {
      return;
    }

    // Edge Case 4: Clear any stuck timeout
    if (findingTimeoutRef.current) {
      clearTimeout(findingTimeoutRef.current);
    }

    // Edge Case 5: Validate filter preferences
    if (preferredGender === undefined || preferredCollege === undefined) {
      console.error('[FindNew] Filter preferences not set');
      return;
    }
    
    // Determine which handler to use
    if (strangerDisconnectedMessageDiv && !hasPaired) {
      handleFindNewWhenSomeoneLeft(
        socket,
        { userDetails, preferredCollege, preferredGender },
        { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages, setIsStrangerVerified, setPairingState },
        hasPaired,
        findingTimeoutRef
      );
    } else {
      handleFindNew(
        socket,
        { userDetails, preferredCollege, preferredGender },
        { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages, setIsStrangerVerified, setPairingState },
        hasPaired,
        findingTimeoutRef
      );
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

  // Start onboarding tour for first-time visitors (always show in debug mode)
  const isDebugMode = false;
  useEffect(() => {
    if (userDetails && socket?.connected && (isDebugMode || !isTextChatTourCompleted)) {
      // Small delay to let the UI render
      const timer = setTimeout(() => {
        dispatch(startTour('textChat'));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userDetails, socket?.connected, isTextChatTourCompleted, dispatch, isDebugMode]);

  // Handle tour step changes (open/close filter as needed)
  const handleTourStepChange = (stepIndex, step) => {
    if (!filterOpenRef.current) return;
    
    if (step.action === 'open-filter') {
      filterOpenRef.current.open();
    } else if (step.action === 'close-filter') {
      filterOpenRef.current.close();
    }
  };

  return (
    <div className={styles.mainC} data-user-gender={userDetails?.gender}>
      {(isChatAvailable && userDetails) && (
        <>
          <MessageDisplay 
            userDetails={userDetails} 
            isStrangerVerified={isStrangerVerified} 
            onlineCount={usersOnline}
            filterOpenRef={filterOpenRef}
          />
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
          
          {/* Onboarding Tour */}
          <OnboardingTour
            tourName="textChat"
            steps={textChatTourSteps}
            onStepChange={handleTourStepChange}
            onComplete={() => {
              if (filterOpenRef.current) {
                filterOpenRef.current.close();
              }
            }}
            onSkip={() => {
              if (filterOpenRef.current) {
                filterOpenRef.current.close();
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default TextChat;
