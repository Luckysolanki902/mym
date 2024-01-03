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
  const [userCollege, setUserCollege] = useState('');
  const [userGender, setUserGender] = useState('');
  const [isFindingPair, setIsFindingPair] = useState(false);
  const [strangerDisconnectedMessageDiv, setStrangerDisconnectedMessageDiv] = useState(false);
  const [preferredGender, setPreferredGender] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('');
  const [room, setRoom] = useState('')

  const messagesContainerRef = useRef(null);
  const router = useRouter();
// Session related_________________________
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
// Session related ends here_________________________

// Filters related and fetching userdetails for sending to server___________________________
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
    preferredGender: userGender === 'male' ? 'female' : 'male',
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
      preferredGender: userGender === 'male' ? 'female' : 'male',
    }));
  }, [userCollege, userGender]);
// Filters related and fetching userdetails for sending to server ends here___________________________



  const handleFindNew = useCallback(() => {
// logic here
  }, [
    // dependencies here if any
  ]);
  
  


  const sendMessage = useCallback((message) => {

  }, [

  ]);

  const handleSend = useCallback(() => {
    if (textValue.trim() !== '') {
      sendMessage(textValue.trim());
      setTextValue('');
    }
  }, [
  ]);

// scrolling to bottom on new message
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
    // logic to decide the message and color for snackbar when a stranger connects #0094d4 for male and message A boy connected and #e3368d for girl and a girl got connected 

  }, [
    // dependencies if any
  ]);




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
