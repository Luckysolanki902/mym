// MessageContainer.js
import React, { useRef, useEffect, useMemo } from 'react';
import { useSpring, animated } from 'react-spring';
import Image from 'next/image';
import Message from '@/components/chatComps/Message';
import styles from '../componentStyles/textchat.module.css';


const MessageContainer = React.memo(({ messages, userDetails, receiver, strangerGender, hasPaired, usersOnline, strangerDisconnectedMessageDiv, strangerIsTyping }) => {
  const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);
  const shouldRenderPaddingDiv = strangerDisconnectedMessageDiv || (hasPaired && strangerIsTyping);

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

  // Animation config for the latest message
  const messageAppearConfig = useMemo(
    () => ({
      tension: 200,
      friction: 20,
      from: { scale: 0.8, opacity: 0 },
      to: { scale: 1, opacity: 1 },
    }),
    []
  );

  // Animation for the latest message
  const messageAnimation = useSpring({
    ...messageAppearConfig,
    reset: true,
    reverse: shouldRenderPaddingDiv && !strangerIsTyping && messages.length > 1, // Only reverse when new message arrives, isTyping is false, and there is more than one message
  });

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
      <div ref={paddingDivRef} className={styles.paddingDiv} style={{ height: shouldRenderPaddingDiv ? '3rem' : 0, opacity: '0' }}>
        sdfasdf
      </div>

      {reversedMessages.map((msg, index) => (
        <animated.div key={index} style={index === 0 ? messageAnimation : {}}>
          <Message key={index} msg={msg} userDetails={userDetails} />
        </animated.div>
      ))}
      {usersOnline && <>Users: {usersOnline}</>}
    </div>
  );
});

export default MessageContainer;
