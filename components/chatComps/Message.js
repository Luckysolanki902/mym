import React from 'react';
import { motion } from 'framer-motion';
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
        // Apply mmMsg or ffMsg based on the shared gender
        receiverClass: userDetails?.gender === 'male' ? styles.mmMsg : styles.ffMsg,
      };
    }
  };

  const { senderClass, receiverClass } = determineClasses();

  if (isTypingMsg) {
    return (
      <motion.div 
        className={`${styles.message} ${styles.left}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div
          style={{
            maxWidth: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className={`${styles.text} ${receiverClass}`}
        >
          <div className={styles.typingIndicator}>
            <span className={styles.typingText}>
              {strangerGender === 'male' ? 'He' : 'She'} is typing
            </span>
            <div className={styles.typingDots}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={styles.typingDot}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`${styles.message} ${
        msg.sender === userDetails?.mid ? styles.right : styles.left
      }`}
      initial={{ opacity: 0, y: 15, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.28,
        ease: [0.34, 1.56, 0.64, 1], // Smooth spring-like easing
        opacity: { duration: 0.25 },
        scale: { duration: 0.3 }
      }}
    >
      <div
        className={`${styles.text} ${
          msg.sender === userDetails?.mid ? senderClass : receiverClass
        }`}
      >
        {msg.message}
      </div>
    </motion.div>
  );
};

export default Message;
