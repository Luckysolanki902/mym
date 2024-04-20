import React, { useEffect } from 'react';
import Image from 'next/image';
import styles from '../componentStyles/textchat.module.css';
import { useTextChat } from '@/context/TextChatContext';

const Message = ({ msg, userDetails }) => {
  const { receiver, strangerGender } = useTextChat();

  // Determine classes based on sender and receiver genders
  const determineClasses = () => {
    if (userDetails?.gender !== strangerGender) {
      // Different genders
      return {
        senderClass: userDetails?.gender === 'male' ? styles.maleMsg : styles.femaleMsg,
        receiverClass: strangerGender === 'male' ? styles.maleMsg : styles.femaleMsg,
      };
    } else {
      // Same gender
      return {
        senderClass: userDetails?.gender === 'male' ? styles.maleMsg : styles.femaleMsg,
        receiverClass: styles.sMsg,
      };
    }
  };

  const { senderClass, receiverClass } = determineClasses();

  return (
    <div
      className={`${styles.message} ${
        msg.sender === userDetails?.email ? styles.right : styles.left
      }`}
    >
      <div className={`${styles.text} ${msg.sender === userDetails?.email ? senderClass : receiverClass}`}>
        {msg.message}
      </div>
    </div>
  );
};

export default Message;
