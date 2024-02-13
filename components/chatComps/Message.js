// components/Message.js
import React from 'react';
import Image from 'next/image';
import styles from '../componentStyles/textchat.module.css';

const Message = ({ msg, userDetails, receiver, strangerGender, hasPaired }) => {
  return (
      <div
        className={`${styles.message} ${
          msg.sender === userDetails?.email ? styles.right : styles.left
        }`}
      >
        <div
          className={`${styles.text} ${
            msg.sender === userDetails?.email
              ? userDetails?.gender === 'male'
                ? styles.maleMsg
                : styles.femaleMsg
              : msg.sender === receiver
              ? userDetails?.gender === 'male'
                ? styles.femaleMsg
                : styles.maleMsg
              : strangerGender === userDetails?.gender
              ? styles.sMsg
              : userDetails?.gender === 'male'
              ? styles.femaleMsg
              : styles.maleMsg
          }`}
        >
          {msg.message}
        </div>
      </div>
  );
};

export default Message;
