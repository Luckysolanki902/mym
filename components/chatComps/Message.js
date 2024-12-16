import React, { useEffect } from 'react';
import Image from 'next/image';
import styles from '../componentStyles/textchat.module.css';
import { useTextChat } from '@/context/TextChatContext';

const Message = ({ msg, userDetails, isTypingMsg = false, strangerGender }) => {


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



  if (isTypingMsg) {
    return (
      <div className={`${styles.message} ${styles.left}`}
      >
        <div style={{ maxWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={`${styles.text} ${receiverClass} 
       ${styles.leftB}`} >
          <div className={styles.typingIndicator}>
            <span>{strangerGender === 'male' ? 'He' : 'She'} is typing</span>
            <span>
              <Image className={styles.istypingImg} priority src={'/gifs/istyping4.gif'} width={800 / 5} height={600 / 5} alt='' />
            </span>
          </div>
        </div>
      </div>
    )
  }




  return (
    <div
      className={`${styles.message} ${msg.sender === userDetails?.email ? styles.right : styles.left
        }`}
    >
      <div className={`${styles.text} ${msg.sender === userDetails?.email ? senderClass : receiverClass} 
       ${msg.sender === userDetails?.email ? styles.rightB : styles.leftB}`}>
        {msg.message}
      </div>
    </div>
  );
};

export default Message;
