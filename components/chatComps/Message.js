import React from 'react';
import { motion } from 'framer-motion';
import styles from '../componentStyles/textchat.module.css';

const Message = React.forwardRef(({ msg, userDetails, isTypingMsg = false, strangerGender, ...props }, ref) => {

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
        ref={ref}
        className={`${styles.message} ${styles.left}`}
        {...props}
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
      ref={ref}
      className={`${styles.message} ${
        msg.sender === userDetails?.mid ? styles.right : styles.left
      }`}
      {...props}
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
});

Message.displayName = 'Message';

export default Message;
