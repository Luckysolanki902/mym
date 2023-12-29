import React from 'react';
import styles from './componentStyles/textchat.module.css';

const TextChat = () => {
    
  return (
    <div className={styles.textChatContainer}>
      <div className={styles.messagesContainer}>
        {/* Empty space for messages */}
        <div className={styles.messages}></div>
        <div className={styles.inputContainer}>
          <button className={styles.newButton}>new</button>
          <div className={styles.textBox}>
            <textarea name="messageBox" id="messageBox" rows={3} style={{ width: '100%' }}></textarea>
          </div>
          <button className={styles.sendButton}>send</button>
        </div>
      </div>
    </div>
  );
};

export default TextChat;
