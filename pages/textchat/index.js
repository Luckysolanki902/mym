import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import FilterOptions from '@/components/FilterOptions';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import styles from '@/components/componentStyles/textchat.module.css';

const ChatPage = () => {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [textValue, setTextValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState('');
  const [userCollege, setUserCollege] = useState('');
  const [userGender, setUserGender] = useState('');
  const [isFindingPair, setIsFindingPair] = useState(false);
  const [strangerDisconnected, setStrangerDisconnected] = useState(false);
  const [strangerGender, setStrangerGender] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('');
  const [room, setRoom] = useState('')

  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);


  const fetchUserDetails = async (email) => {
    try {
      const response = await fetch(`/api/getuserdetails?userEmail=${email}`);
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const userData = await response.json();
      setUserCollege(userData.college || 'Not Available');
      setUserGender(userData.gender || 'Not Available');
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const [filters, setFilters] = useState({
    college: userCollege,
    strangerGender: userGender === 'male' ? 'female' : 'male',
  });

  useEffect(() => {
    if (userEmail) {
      fetchUserDetails(userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      college: userCollege || 'any',
      strangerGender: userGender === 'male' ? 'female' : 'male',
    }));
  }, [userCollege, userGender]);



  const handleFindNew = useCallback(() => {
    setMessages([]);
    setReceiver('');
    setStrangerDisconnected(false);
  
    if (socket) {
      setIsFindingPair(true); // Add this to signify the search is in progress
      socket.emit('newPairing', {
        strangerGender: filters.strangerGender,
        strangerCollege: filters.college,
      });
      // Delay to prevent frequent "new" button clicks
      setTimeout(() => {
        setIsFindingPair(false);
      }, 15000); // Adjust the delay duration as needed
    } else {
      router.reload();
    }
  }, [socket, receiver, filters]);
  
  


  const sendMessage = useCallback((message) => {
    if (!room || !receiver || !socket){ 
      console.log('cannot happen')
      return};

    socket.emit('message', { room: room, message });
    // Log the sent message
    console.log(`Message sent to ${receiver}: ${message}`);
    console.log('message array:', message)
  }, [socket, receiver]);

  const handleSend = useCallback(() => {
    if (textValue.trim() !== '') {
      sendMessage(textValue.trim());
      setTextValue('');
    }
  }, [textValue, sendMessage]);

  useEffect(() => {
    const newSocket = io('http://localhost:3001'); // Connect to the server
    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.close(); // Close the socket connection when unmounting
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      socket.emit('user connected', {
        userName: userEmail,
        strangerGender: filters.strangerGender,
        strangerCollege: filters.college,
      });
    });

    socket.on('chatStart', ({ room }) => {
      setReceiver(room.split('-').find(id => id !== socket.id)); // Extracting receiver's ID
      console.log('room is:', room)
      setRoom(room)
      setIsFindingPair(false)
    });

    socket.on('message', ({ message, sender }) => {
      console.log(`Message received from ${sender}: ${message}`);
      setMessages(prevMessages => [...prevMessages, { message, sender }]);
    });

    socket.on('typing', (senderId) => {
      // Handle typing event
    });

    socket.on('stoppedTyping', (senderId) => {
      // Handle stopped typing event
    });

    socket.on('disconnect', () => {
      setStrangerDisconnected(true);
      // Handle stranger disconnection event
    });

    socket.on('partnerDisconnected', () => {
      // Handle partner disconnecting notification
    });

    return () => {
      socket.off('connect');
      socket.off('chatStart');
      socket.off('message');
      socket.off('typing');
      socket.off('stoppedTyping');
      socket.off('disconnect');
      socket.off('partnerDisconnected');
    };
  }, [socket, userEmail, filters]);

  useEffect(() => {
    // Auto scroll to bottom when new message arrives
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  }, []);
  

  useEffect(() => {
    if (strangerGender !== '') {
      let color;
      let message;

      if (strangerGender === 'male') {
        color = '#0094d4';
        message = 'A boy connected';
      } else if (strangerGender === 'female') {
        color = '#e3368d';
        message = 'A girl connected';
      } else {
        color = 'blue';
        message = 'Someone connected';
      }

      setSnackbarColor(color);
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    }
  }, [strangerGender]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    router.replace('/signin');
    return null;
  }



  // Other functions related to typing, new pair, etc.

  return (
    <div>
      <div className={styles.textChatContainer}>
        <FilterOptions
          filters={filters}
          setFilters={setFilters}
          userCollege={userCollege}
          userGender={userGender}
          setUserGender={setUserGender}
        />
        <div className={styles.messagesContainer} ref={messagesContainerRef}>
          <div className={styles.messages}>
            {messages.map((msg, index) => (
              <div className={styles.mainmessage} key={index}>
                <div
                  className={`${styles.message} ${msg.sender === userEmail ? styles.right : styles.left}`}
                >
                  <div className={`${styles.text} ${msg.sender === userEmail ?
                    (userGender === 'male' ? styles.maleMsg : styles.femaleMsg) :
                    (msg.sender === receiver ?
                      (userGender === 'male' ? styles.femaleMsg : styles.maleMsg) :
                      (strangerGender === userGender ? styles.sMsg :
                        (userGender === 'male' ? styles.femaleMsg : styles.maleMsg)))
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {strangerDisconnected && (
            <div>strangerDisconnected</div>
          )}
          <div className={styles.inputContainer}>
            <button className={styles.newButton} disabled={isFindingPair} onClick={handleFindNew}>
              {isFindingPair ? (
                <CircularProgress size={24} />
              ) : (
                'New'
              )}
            </button>
            <div className={styles.textBox}>
              <form onSubmit={handleSend}>
                <textarea
                  name="messageBox"
                  id="messageBox"
                  value={textValue}
                  rows={3}
                  onChange={(e) => setTextValue(e.target.value)}
                  style={{ width: '100%' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim() !== '') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                ></textarea>
              </form>
            </div>
            <button className={styles.sendButton} onClick={handleSend}>
              Send
            </button>
          </div>
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
