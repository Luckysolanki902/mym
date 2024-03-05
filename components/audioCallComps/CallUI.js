// MessageContainer.js
import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import Message from '@/components/chatComps/Message';
import styles from '../componentStyles/textchat.module.css';

const MessageContainer = ({ messages, userDetails, receiver, strangerGender, hasPaired, usersOnline, strangerDisconnectedMessageDiv, strangerIsTyping }) => {
  const reversedMessages = [...messages].reverse();
  const shouldRenderPaddingDiv = strangerDisconnectedMessageDiv || (hasPaired && strangerIsTyping) ;

  // Create a ref for the padding div
  const paddingDivRef = useRef(null);

  // Function to scroll to the padding div when a new message arrives
  const scrollToPaddingDiv = () => {
    if (paddingDivRef.current) {
      paddingDivRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to the padding div on component mount or when a new message arrives
  useEffect(() => {
    scrollToPaddingDiv();
  }, [messages]);

  return (
    <div className={`${styles.messCon} ${!hasPaired && !strangerIsTyping && styles.nopadb}`}>
      {strangerDisconnectedMessageDiv && !hasPaired && (
        <>
          <div className={styles.isTyping}>He said “good Bye!!”</div>
        </>
      )}

      {/* Padding div with dynamic height based on conditions */}
      {usersOnline && <>Users: {usersOnline}</>}
    </div>
  );
};

export default MessageContainer;
