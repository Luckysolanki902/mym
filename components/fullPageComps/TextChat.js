import React, { useEffect, useRef, useState, useCallback } from 'react';
import FilterOptions from '@/components/chatComps/FilterOptions';
import styles from '../componentStyles/textchat.module.css';
import { initiateSocket } from '@/utils/ramdomchat/initiateSocket';
import { handleSend, handleTyping, handleStoppedTyping, handleFindNew, stopFindingPair } from '@/utils/ramdomchat/socketFunctions';
import CustomSnackbar from '../commonComps/Snackbar';
import InputBox from '../chatComps/InputBox';
import MessageDisplay from '../chatComps/MessagesDisplay';
import EventsContainer from '../chatComps/EventsContainer';

const TextChat = ({ userDetails }) => {
  const [socket, setSocket] = useState(null);
  const [textValue, setTextValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isFindingPair, setIsFindingPair] = useState(false);
  const [strangerDisconnectedMessageDiv, setStrangerDisconnectedMessageDiv] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [preferredGender, setPreferredGender] = useState('any');
  const [preferredCollege, setPreferredCollege] = useState('any')
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('');
  const [room, setRoom] = useState('');
  const [receiver, setReceiver] = useState('');
  const [strangerGender, setStrangerGender] = useState('');
  const [hasPaired, setHasPaired] = useState(false);
  const [strangerIsTyping, setStrangerIsTyping] = useState(false);
  const [usersOnline, setUsersOnline] = useState('');
  const [inpFocus, setInpFocus] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const findingTimeoutRef = useRef(null);
  const [filters, setFilters] = useState({
    college: userDetails?.college,
    strangerGender: userDetails?.gender === 'male' ? 'female' : 'male',
  });

  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      college: userDetails?.college || 'any',
      preferredGender: userDetails?.gender === 'male' ? 'female' : 'male',
    }));
  }, [userDetails]);
 
  useEffect(() => {
    setPreferredCollege(filters.college)
    setPreferredGender(filters.strangerGender)
  }, [filters])


  // Provide socket and handle socketEvents___________________________
  useEffect(() => {
    initiateSocket(socket, { userDetails, preferredCollege, preferredGender }, hasPaired, {room, setSocket, setUsersOnline, setStrangerIsTyping, setStrangerDisconnectedMessageDiv, setIsFindingPair, setRoom, setReceiver, setStrangerGender, setSnackbarColor, setSnackbarMessage, setSnackbarOpen, setHasPaired, setMessages }, { messagesContainerRef, findingTimeoutRef })

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleSendButton = () => {
    handleSend(socket, textValue, { setTextValue, setMessages, setStrangerIsTyping }, messagesContainerRef, userDetails, hasPaired)
  }

  const handleFindNewButton = () => {
    if (socket) {
      if( !isFindingPair){
        handleFindNew(socket, { userDetails, preferredCollege, preferredGender }, { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages, }, hasPaired, findingTimeoutRef)
      }
      else{
        stopFindingPair(socket, { setIsFindingPair })
      }
    } else {
      initiateSocket(socket, { userDetails, preferredCollege, preferredGender }, hasPaired, { setSocket, setUsersOnline, setStrangerIsTyping, setStrangerDisconnectedMessageDiv, setIsFindingPair, setRoom, setReceiver, setStrangerGender, setSnackbarColor, setSnackbarMessage, setSnackbarOpen, setHasPaired, setMessages }, { messagesContainerRef, findingTimeoutRef })
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
      <div className={styles.filterPos}>
        <FilterOptions
          filters={filters}
          setFilters={setFilters}
          userCollege={userDetails?.college}
          userGender={userDetails?.gender}
        />
      </div>

      <MessageDisplay
        messages={messages}
        userDetails={userDetails}
        receiver={receiver}
        strangerGender={strangerGender}
        hasPaired={hasPaired}
        usersOnline={usersOnline}
        strangerDisconnectedMessageDiv={strangerDisconnectedMessageDiv}
        strangerIsTyping={strangerIsTyping}
      />



      <InputBox
        isFindingPair={isFindingPair}
        handleFindNewButton={handleFindNewButton}
        handleSendButton={handleSendButton}
        textValue={textValue}
        setTextValue={setTextValue}
        inpFocus={inpFocus}
        setInpFocus={setInpFocus}
        handleKeyDown={handleKeyDown}
        handleStoppedTyping={handleStoppedTyping}
        socket={socket}
        strangerIsTyping={strangerIsTyping}
        typingTimeoutRef={typingTimeoutRef}
        inputRef={inputRef}
        userDetails = {userDetails}
        hasPaired={hasPaired}
      />
      <CustomSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        color={snackbarColor}
      />
    </div>
  );
};

export default TextChat