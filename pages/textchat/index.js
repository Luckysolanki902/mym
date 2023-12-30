import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '@/components/componentStyles/textchat.module.css';
import FilterOptions from '@/components/FilterOptions';

const useSendMessage = (socket, sender, receiver) => {
  const sendMessage = useCallback(
    (message) => {
      socket.emit('sendMessage', { sender, receiver, message });
      console.log('message sent', sender, receiver)
    },
    [socket, sender, receiver]
  );

  return sendMessage;
};

const ChatPage = () => {
  const { data: session, status } = useSession();
  const [userEmail, setUserEmail] = useState('');
  const [textValue, setTextValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState('');
  const messagesContainerRef = useRef(null);
  const socket = useRef(null);
  const router = useRouter();
  const [userCollege, setUserCollege] = useState('');
  const [userGender, setUserGender] = useState('');

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

  const sendMessage = useSendMessage(socket.current, userEmail, receiver);

  const handleChange = (event) => {
    const { value } = event.target;
    setTextValue(value);
  };

  const handleSend = () => {
    if (textValue.trim() !== '') {
      sendMessage(textValue.trim());
      setTextValue('');
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    socket.current = io('http://localhost:3001');
    if (userEmail) {
      socket.current.emit('user connected', {
        displayName: userEmail,
        strangerGender: filters.strangerGender,
        strangerCollege: filters.college,
      });
    }

    socket.current.on('paired', ({ displayName, receiver }) => {
      if (displayName === userEmail) {
        setReceiver(receiver);
      }
    });

    socket.current.on('receiveMessage', ({ sender, message }) => {
      console.log(sender, message)
      setMessages((prevMessages) => [...prevMessages, { sender, message }]);
    });

  }, [userEmail, filters]);

  useEffect(() => {
    if (receiver) {
      // Perform actions here when the receiver changes
    }
  }, [receiver]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    router.replace('/signin');
    return null;
  }

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
              <div
                key={index}
                className={`${styles.message} ${
                  msg.sender === userEmail ? styles.left : styles.right
                }`}
              >
                {msg.sender === userEmail ? 'Me' : 'Stranger'}: {msg.message}
              </div>
            ))}
          </div>
          <div className={styles.inputContainer}>
            <button className={styles.newButton}>new</button>
            <div className={styles.textBox}>
              <textarea
                name="messageBox"
                id="messageBox"
                value={textValue}
                rows={3}
                onChange={handleChange}
                style={{ width: '100%' }}
              ></textarea>
            </div>
            <button className={styles.sendButton} onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
