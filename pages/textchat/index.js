import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import styles from '@/components/componentStyles/textchat.module.css';
import FilterOptions from '@/components/FilterOptions';
import { io } from 'socket.io-client';

const ChatPage = () => {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [textValue, setTextValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [userCollege, setUserCollege] = useState('');
  const [userGender, setUserGender] = useState('');
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

  const messagesContainerRef = useRef(null);
  const router = useRouter();


  // Function to fetch user details
  useEffect(() => {
    if (userEmail) {
      fetchUserDetails(userEmail);
    }
  }, [userEmail]);

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
    setFilters((prevFilters) => ({
      ...prevFilters,
      college: userCollege || 'any',
      preferredGender: userGender === 'male' ? 'female' : 'male',
    }));
  }, [userCollege, userGender]);

  useEffect(() => {
    setPreferredCollege(filters.college)
    setPreferredGender(filters.strangerGender)
  }, [filters])

  // findnew function___________________________
  useEffect(() => {
    const newSocket = io('http://localhost:8080'); // Replace with your server URL if different

    newSocket.on('connect', () => {
      console.log('Connected to server:', newSocket.id);
      if (userEmail && userGender && userCollege && preferredCollege && preferredGender) {
        // Identify user and send preferences to the server
        newSocket.emit('identify', {
          userEmail: userEmail,
          userGender: userGender,
          userCollege: userCollege,
          preferredGender: preferredGender,
          preferredCollege: preferredCollege,
        });

      }

      // Handling the successful pairing event
      newSocket.on('pairingSuccess', (data) => {
        console.log('Pairing Success:', data);
        setIsFindingPair(false);
        const { roomId, strangerGender, stranger } = data;
      
        setRoom(roomId);
        setReceiver(stranger);
        setStrangerGender(strangerGender); 
      });

      // Handle received messages from the server
      newSocket.on('message', (data) => {
        handleReceivedMessage(data);
        console.log('message event')
      });

      // Handle user disconnection event
      newSocket.on('pairDisconnected', () => {
        console.log('Pair disconnected, my socket id is:', socket);
        // Handle pair disconnection as needed
      });

      setSocket(newSocket);
    });

    // Clear socket on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [userEmail, userGender, userCollege, preferredCollege, preferredGender]);


  const handleFindNew = useCallback(() => {

    if (socket) {
      setIsFindingPair(true); // Set finding pair state to true

      socket.emit('findNewPair', {
        userEmail: userEmail,
        userGender: userGender,
        userCollege: userCollege,
        preferredGender: preferredGender,
        preferredCollege: preferredCollege,
      }); // Send request to find a new pair with all details variables
      console.log('finding new pair as:', userEmail, userGender, userCollege, preferredGender, preferredCollege)

      // Set a timeout to simulate pairing process (Remove this in actual implementation)
      setTimeout(() => {
        setIsFindingPair(false); // Set finding pair state to false after the timeout (Remove this in actual implementation)
      }, 10000); // Replace 3000 with your desired duration or remove it in actual implementation
    }
  }, [socket, userEmail, userGender, userCollege, preferredGender, preferredCollege]);


  const handleReceivedMessage = useCallback((data) => {
    const { sender, content } = data;
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, message: content },
    ]);
  }, []);

  const sendMessage = useCallback((message) => {
    if (message.trim() !== '') {
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
      { sender: userEmail, message: textValue.trim() },
    ]);
  }, [textValue, sendMessage]);

  useEffect(() => {
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
    // Logic to handle snackbar messages for stranger connections
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    router.replace('/signin');
    return null;
  }

  // Other functions related to typing, stopped, typing

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
                      (preferredGender === userGender ? styles.sMsg :
                        (userGender === 'male' ? styles.femaleMsg : styles.maleMsg)))
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {strangerDisconnectedMessageDiv && (
            <div>strangerDisconnectedMessageDiv</div>
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
