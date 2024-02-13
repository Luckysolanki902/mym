// MessageContainer.js
import React from 'react';
import Image from 'next/image';
import Message from '@/components/chatComps/Message';
import styles from '../componentStyles/textchat.module.css';

const MessageContainer = ({ messages, userDetails, receiver, strangerGender, hasPaired, usersOnline, strangerDisconnectedMessageDiv, strangerIsTyping }) => {
  return (
    <div className={`${styles.messCon} ${!hasPaired && !strangerIsTyping && styles.nopadb}`}>
      <div className={styles.messages}>
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
        {usersOnline && <>Users: {usersOnline}</>}

        {strangerDisconnectedMessageDiv && !hasPaired && (
          <>
            <div className={styles.isTyping}>He said “good Bye!!”</div>
          </>
        )}
        {hasPaired && strangerIsTyping && (
          <>
            <div className={`${styles.isTyping} ${!hasPaired && !strangerIsTyping && styles.isTypinghz}`}>
              {strangerGender === 'male' ? 'He' : 'She'} is typing{' '}
              <span>
                <Image src={'/gifs/istyping4.gif'} width={800 / 2} height={600 / 2} alt='' />
              </span>{' '}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageContainer;
