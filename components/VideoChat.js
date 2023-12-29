// components/VideoChat.js

import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/router';
import styles from './componentStyles/videochat.module.css';

const OmegleVideoChat = ({ username }) => {
  const videoRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const socket = io('http://localhost:3001');

    const enableVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera/microphone:', err);
      }
    };

    // Function to get the username from the passed query parameters
    const getUsernameFromQuery = () => {
      const { username } = queryParams;
      return username || 'DefaultUsername'; // Set a default username if none provided
    };

    // Get the username from the passed query parameters
    const username = getUsernameFromQuery();

    // Emit 'user connected' event with the username on connection
    socket.emit('user connected', { displayname: username });

    // enableVideo();
 
    return () => {
      // Stop video tracks when the component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      socket.disconnect(); // Disconnect the socket when unmounting the component
    };
  }, [queryParams]);



  return (
    <div className={styles.videoChatContainer}>
      <div className={styles.sidebar}>
        <video ref={videoRef} className={styles.videoBox} autoPlay playsInline muted></video>
        <div className={styles.videoBox}></div>
      </div>
      <div className={styles.messagesContainer}>
        {/* Empty space for messages */}
        <div className={styles.messages}></div>
        <div className={styles.inputContainer}>
          <div style={{ width: '100%', display: 'flex', marginTop: '2rem', alignItems: 'center', justifyContent: 'center', height: '2rem' }}>
            <button className={styles.nextButton}>next</button>
            <div className={styles.messageBox}>
              <textarea name="messageBox" id="messageBox" rows={3} style={{ width: '100%' }}></textarea>
            </div>
            <button className={styles.sendButton}>send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmegleVideoChat;
