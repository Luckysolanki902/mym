import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import styles from '@/components/componentStyles/videochat.module.css';
import FilterOptions from '@/components/FilterOptions';
const useSendMessage = (socket, sender, receiver) => {
  const sendMessage = useCallback((message) => {
    socket.emit('sendMessage', { sender, receiver, message });
  }, [socket, sender, receiver]);

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
      const response = await fetch(`/api/getuserdetails?userEmail=${email}`); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const userData = await response.json();

      // Set userCollege and userGender based on fetched data
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
      
     try {
       fetchUserDetails(userEmail);
     } catch (error) {
      console.log('error:', error)
     }
    }
  }, [userEmail]);
  useEffect(() => {
    if (userCollege && userGender) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        college: userCollege || 'any',
        strangerGender: userGender === 'male' ? 'female' : 'male',
      }));
    }
  }, [userCollege, userGender, setFilters]);

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
    if (session && session.user && session.user.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    socket.current = io('http://localhost:3001');

    if (userEmail) {
      socket.current.emit('user connected', { displayName: userEmail, strangerGender: filters.strangerGender, strangerCollege : filters.college });
    }

    socket.current.on('paired', ({ displayName, receiver }) => {
      if (displayName === userEmail) {
        setReceiver(receiver); // Update the receiver state when paired
        console.log('paired')
      }
    });

    socket.current.on('receiveMessage', ({ sender, message }) => {
      setMessages((prevMessages) => [...prevMessages, { sender, message }]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [userEmail]);

  useEffect(() => {
    if (receiver) {
      // Perform actions here when the receiver changes
      // Example: You can add code to handle the receiver information
    }
  }, [receiver]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    router.replace("/signin");
    return null;
  }

  return (
    <div className={styles.videoChatContainer}>
      <h1>{session.user.email}</h1>
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        <FilterOptions
          filters={filters}
          setFilters={setFilters}
          userCollege={userCollege}
          userGender={userGender}
          setUserGender={setUserGender} // Add this prop
        />
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${msg.sender === userEmail ? styles.left : styles.right}`}>
            {msg.sender === userEmail ? 'Me' : 'Stranger'}: {msg.message}
          </div>
        ))}
      </div>
      <div className={styles.inputContainer}>
        <div style={{ width: '100%', display: 'flex', marginTop: '2rem', alignItems: 'center', justifyContent: 'center', height: '2rem' }}>
          <div className={styles.messageBox}>
            <textarea name="messageBox" id="messageBox" value={textValue} rows={3} onChange={handleChange} style={{ width: '100%' }}></textarea>
          </div>
          <button className={styles.sendButton} onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;