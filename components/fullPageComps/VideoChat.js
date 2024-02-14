import React, { useEffect, useRef, useState, useCallback } from 'react';
import FilterOptions from '@/components/chatComps/FilterOptions';
import styles from '../componentStyles/textchat.module.css';
import { initiateSocket } from '@/utils/ramdomchat/initiateSocket';
import { handleSend, handleTyping, handleStoppedTyping, handleFindNew } from '@/utils/ramdomchat/socketFunctions';
import CustomSnackbar from '../commonComps/Snackbar';
import InputBox from '../chatComps/InputBox';
import MessageContainer from '../chatComps/MessageContainer';
import VideoCall from '../chatComps/VideoCall';
import { startVideoCall, endVideoCall } from '@/utils/ramdomchat/socketFunctions';

const VideoChat = ({ userDetails }) => {

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

  // VideoCall states
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [myStream, setMyStream] = useState(null);
  const [partnerStream, setPartnerStream] = useState(null);
  const [peer, setPeer] = useState(null);

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
    initiateSocket(socket, { userDetails, preferredCollege, preferredGender }, hasPaired, { setSocket, setUsersOnline, setStrangerIsTyping, setStrangerDisconnectedMessageDiv, setIsFindingPair, setRoom, setReceiver, setStrangerGender, setSnackbarColor, setSnackbarMessage, setSnackbarOpen, setHasPaired, setMessages }, { messagesContainerRef })

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Get Permission for camera and microphone
  useEffect(() => {
    if (isVideoCallOpen && !myStream) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setMyStream(stream);
        })
        .catch((error) => {
          console.error('Error accessing camera and microphone:', error);
        });
    }
  }, [isVideoCallOpen]);

  const toggleVideoCall = () => {
    setIsVideoCallOpen(!isVideoCallOpen);

    if (!isVideoCallOpen) {
      startVideoCall(socket, myStream, { setPartnerStream, setPeer });
    } else {
      endVideoCall(socket, myStream, { setPartnerStream, setPeer });
    }
  };

  const handleSendButton = () => {
    handleSend(socket, textValue, { setTextValue, setMessages, setStrangerIsTyping }, messagesContainerRef, userDetails)
  }

  const handleFindNewButton = () => {
    if (socket) {
      handleFindNew(socket, { userDetails, preferredCollege, preferredGender }, { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages, })
    } else {
      initiateSocket(socket, { userDetails, preferredCollege, preferredGender }, hasPaired, { setSocket, setUsersOnline, setStrangerIsTyping, setStrangerDisconnectedMessageDiv, setIsFindingPair, setRoom, setReceiver, setStrangerGender, setSnackbarColor, setSnackbarMessage, setSnackbarOpen, setHasPaired, setMessages }, { messagesContainerRef })
    }
  }


  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendButton();
    } else {
      handleTyping(e, socket, typingTimeoutRef);
    }
  }

  return (
    <div className={styles.mainC} style={{overflowY:'auto'}}>
      <div className={styles.filterPos} style={{opacity:'0'}}>
        <FilterOptions
          filters={filters}
          setFilters={setFilters}
          userCollege={userDetails?.college}
          userGender={userDetails?.gender}
        />
      </div>
      {/* <MessageContainer
        messages={messages}
        userDetails={userDetails}
        receiver={receiver}
        strangerGender={strangerGender}
        hasPaired={hasPaired}
        usersOnline={usersOnline}
        strangerDisconnectedMessageDiv={strangerDisconnectedMessageDiv}
        strangerIsTyping={strangerIsTyping}
      /> */}

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
      />
      <CustomSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        color={snackbarColor}
      />
      <button onClick={toggleVideoCall}>
        {isVideoCallOpen ? 'End Video Call' : 'Start Video Call'}
      </button>

      {isVideoCallOpen && (
        <VideoCall myStream={myStream} partnerStream={partnerStream} />
      )}
    </div>
  );
};



export default VideoChat