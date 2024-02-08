import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import styles from './textchat.module.css';
import FilterOptions from '@/components/FilterOptions';
import { io } from 'socket.io-client';
import Image from 'next/image';
import { IoIosSend } from "react-icons/io";
import { useAuth } from '@/AuthContext';
import Message from '@/components/Message';


const ChatPage = () => {
  const { loading, userDetails } = useAuth();
  const router = useRouter();


  const [socket, setSocket] = useState(null);
  const [textValue, setTextValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isFindingPair, setIsFindingPair] = useState(false);
  const [strangerDisconnectedMessageDiv, setStrangerDisconnectedMessageDiv] = useState(false);
  const [preferredGender, setPreferredGender] = useState('any');
  const [preferredCollege, setPreferredCollege] = useState('any')
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('');
  const [room, setRoom] = useState('');
  const [receiver, setReceiver] = useState('')
  const [strangerGender, setStrangerGender] = useState('')
  const [hasPaired, setHasPaired] = useState(false);
  const [userIsTyping, setUserIsTyping] = useState(false);
  const [usersOnline, setUsersOnline] = useState('')
  const [inpFocus, setInpFocus] = useState(false)
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [refreshOnClick, setRefreshOnClick] = useState(false)


  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const messagesContainer = messagesContainerRef.current;
      const lastMessage = messagesContainer.lastElementChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest', inlineSize: 1 });
      }
    }
  };



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

  const handlePairDisconnectedStrict = useCallback(() => {
    console.log('Partner disconnected by refreshing or closing');
    setStrangerDisconnectedMessageDiv(true);
    setHasPaired(false);
    scrollToBottom()
    setRefreshOnClick(true)
    // Add any additional cleanup or logic you want to run on partner disconnection
  }, []);

  // findnew function___________________________
  useEffect(() => {
    let newSocket
    try {
      if (socket === null || !socket || newSocket === undefined) {
        newSocket = io('https://hostedmymserver.onrender.com');
        // newSocket = io('http://localhost:1000');
        setSocket(newSocket)
      } else {
        newSocket = socket
      }
    } catch (error) {
      console.log('error setting newsocket', error)
    }
    newSocket.on('connect', () => {
      console.log('Connected to server');
      if (userDetails && preferredCollege && preferredGender) {
        // Identify user and send preferences to the server
        newSocket.emit('identify', {
          userEmail: userDetails?.email,
          userGender: userDetails?.gender,
          userCollege: userDetails?.college,
          preferredGender: preferredGender,
          preferredCollege: preferredCollege,
        });

      }
      newSocket.on('roundedUsersCount', (count) => {
        setUsersOnline(count)
      })


      // Handling the successful pairing event
      newSocket.on('pairingSuccess', (data) => {
        if (!hasPaired) {
          setStrangerDisconnectedMessageDiv(false)
          setIsFindingPair(false);
          const { roomId, strangerGender, stranger } = data;
          setRoom(roomId);
          setReceiver(stranger);
          setStrangerGender(strangerGender);
          if (strangerGender === 'male') {
            setSnackbarColor('#0094d4'); // Set Snackbar color for a boy
            setSnackbarMessage('A boy connected');
          } else if (strangerGender === 'female') {
            setSnackbarColor('#e3368d'); // Set Snackbar color for a girl
            setSnackbarMessage('A girl connected');
          }
          setSnackbarOpen(true); // Show the Snackbar
        }
        setHasPaired(true)
      });

      // Handling received messages from the server
      newSocket.on('message', (data) => {
        handleReceivedMessage(data);
      });
      // Handling received messages from the server
      newSocket.on('userTyping', () => {
        setUserIsTyping(true)
      });
      // Handling received messages from the server
      newSocket.on('userStoppedTyping', () => {
        setUserIsTyping(false)
      });

      // Handling user disconnection event
      newSocket.on('pairDisconnected', () => {
        console.log('Partner disconnected');
        setStrangerDisconnectedMessageDiv(true)
        scrollToBottom()

        setHasPaired(false)
      });
      // Handling user strict-disconnection event
      newSocket.on('pairDisconnectedStrict', handlePairDisconnectedStrict);

      // handling my disconnection
      newSocket.on('disconnect', () => {
        setSocket(null)
        console.log('disconnect message')
      });
    });



    // Clear socket on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [userDetails, preferredCollege, preferredGender]);


  const handleFindNew = useCallback(() => {
    if (socket && !refreshOnClick) {
      setHasPaired(false)
      setIsFindingPair(true); // Set finding pair state to true
      setStrangerDisconnectedMessageDiv(false);

      setMessages([]);
      socket.emit('findNewPair', {
        userEmail: userDetails?.email,
        userGender: userDetails?.gender,
        userCollege: userDetails?.college,
        preferredGender: preferredGender,
        preferredCollege: preferredCollege,
      }); // Send request to find a new pair with all details variables
      console.log('finding new pair');

      // Set a timeout to simulate pairing process (Remove this in the actual implementation)
      setTimeout(() => {
        setIsFindingPair(false); // Set finding pair state to false after the timeout (Remove this in the actual implementation)
      }, 10000); // Replace 3000 with your desired duration or remove it in the actual implementation
    } else {
      router.reload();
    }
  }, [refreshOnClick, socket, userDetails, preferredGender, preferredCollege, router]);



  const handleReceivedMessage = useCallback((data) => {
    setUserIsTyping(false)
    const { sender, content } = data;
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, message: content },
    ]);
    scrollToBottom()
  }, []);

  const sendMessage = useCallback((message) => {
    if (message.trim() !== '' && socket) {
      socket.emit('message', { type: 'message', content: message });
    }
  }, [socket]);

  const handleSend = useCallback(() => {
    if (textValue.trim() !== '') {
      sendMessage(textValue.trim());
      setTextValue('');
    }
    setMessages(prevMessages => [
      ...prevMessages,
      { sender: userDetails?.email, message: textValue.trim() },
    ]);
    scrollToBottom()
  }, [textValue, sendMessage]);


  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  }, []);





  // handle partner's typing
  const handleTyping = (event) => {
    // Handle the typing event and emit to the server
    if (event.key !== 'Enter' && socket) {
      if (!userIsTyping) {
        socket.emit('typing');
      } else {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stoppedTyping');
      }, 1500); // Adjust the duration as needed (e.g., 1500 milliseconds = 1.5 seconds)
    }
  };

  const handleStoppedTyping = () => {
    // Handle the stopped typing event and emit to the server
    if (userIsTyping && socket) {
      socket.emit('stoppedTyping');

    }
  };




  // Other functions related to typing, stopped, typing

  return (
    <div className={styles.mainC}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', }} className={styles.filterPos}>
        {/* {usersOnline && <>
          <div>Users Online: <span>{usersOnline}</span><span>+</span></div>
        </>} */}

        <FilterOptions
          filters={filters}
          setFilters={setFilters}
          userCollege={userDetails?.college}
          userGender={userDetails?.gender}
        />
      </div>
      <div className={`${styles.messCon} ${!hasPaired && !userIsTyping && styles.nopadb}`}>
        <div className={styles.messages} ref={messagesContainerRef}>
          {/* {hasPaired && !userIsTyping && messages.length===0 && <div className={styles.isTyping}>paired with a {strangerGender === 'male' ? 'boy' : 'girl'}</div>} */}
          {messages.map((msg, index) => (
            <div key={index}>
              <Message
                key={index}
                msg={msg}
                userDetails={userDetails}
                receiver={receiver}
                strangerGender={strangerGender}
                hasPaired={hasPaired}
              />
            </div>
          ))}

          {strangerDisconnectedMessageDiv && !hasPaired && (
            <>
              <div className={styles.isTyping}>He said “good Bye!!”
              </div>
            </>
          )}
          {hasPaired && userIsTyping && <><div className={`${styles.isTyping} ${!hasPaired && !userIsTyping && styles.isTypinghz}`}>{strangerGender === 'male' ? 'He' : 'She'} is typing <span><Image src={'/gifs/istyping4.gif'} width={800 / 2} height={600 / 2} alt=''></Image></span> </div></>}
        </div>

      </div>

      <div className={`${styles.inputContainerMainDiv}`}>
        <div className={`${styles.inputContainer} ${inpFocus ? styles.inpFocus : ''}`}>
          <button className={styles.newButton} disabled={isFindingPair} onClick={handleFindNew} title={hasPaired ? 'Say Good Bye' : 'Find New'}>
            {isFindingPair && !hasPaired ? (
              <CircularProgress size={24} style={{ color: 'white' }} />
            ) : (
              <Image
                src={'/images/sidebaricons/randomchat.png'}
                width={1080 / 10}
                height={720 / 10}
                alt='icon'
                className={styles.randomIcon}
              />
            )}
          </button>

          <div className={styles.textBox}>
            <form onSubmit={handleSend} className={styles.textBox}>
              <input
                className={styles.textBox}
                name="messageBox"
                spellCheck='false'
                autoCorrect='false'
                placeholder={'Start typing...'}
                autoFocus
                type='text'
                id="messageBox"
                value={textValue}
                onFocus={() => setInpFocus(true)}
                autoComplete='off'
                onBlurCapture={() => setInpFocus(false)}
                onChange={(e) => setTextValue(e.target.value)}
                style={{ width: '100%' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.target.value.trim() !== '') {
                      handleSend();
                      clearTimeout(typingTimeoutRef.current);
                      setUserIsTyping(false);
                    }
                  } else {
                    handleTyping(e);
                  }
                }}
                onBlur={() => {
                  clearTimeout(typingTimeoutRef.current); // Clear typing timeout when the input loses focus
                  handleStoppedTyping(); // Stop typing on blur
                }} // Handling stopped typing event on blur
              ></input>
            </form>
          </div>
          <button className={`${styles.newButton} ${styles.newButton2}`} onClick={handleSend}>
            <IoIosSend className={styles.sendIcon} />
          </button>
        </div>
      </div>
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose}>
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity="info"
          style={{ backgroundColor: snackbarColor }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default ChatPage;
