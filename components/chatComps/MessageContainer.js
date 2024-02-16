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
      {hasPaired && strangerIsTyping && (
        <>
          <div className={`${styles.isTyping}`}>
            {strangerGender === 'male' ? 'He' : 'She'} is typing{' '}
            <span>
              <Image src={'/gifs/istyping4.gif'} width={800 / 2} height={600 / 2} alt='' />
            </span>{' '}
          </div>
        </>
      )}

      {/* Padding div with dynamic height based on conditions */}
      <div ref={paddingDivRef} className={styles.paddingDiv} style={{ height: shouldRenderPaddingDiv ? '3rem' : 0 , opacity:'0'}} >sdfasdf</div>

      {reversedMessages.map((msg, index) => (
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
      {usersOnline && <>Users: {usersOnline}</>}
    </div>
  );
};

export default MessageContainer;
