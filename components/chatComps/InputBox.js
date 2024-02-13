// InputBox.js
import React, { useState, useRef, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Image from 'next/image';
import { IoIosSend } from 'react-icons/io';
import styles from '../componentStyles/textchat.module.css';

const InputBox = ({
  isFindingPair,
  handleFindNewButton,
  handleSendButton,
  textValue,
  setTextValue,
  inpFocus,
  setInpFocus,
  handleKeyDown,
  handleStoppedTyping,
  socket,
  strangerIsTyping,
  typingTimeoutRef,
}) => {
  return (
    <div className={`${styles.inputContainer} ${inpFocus ? styles.inpFocus : ''}`}>
      <button className={styles.newButton} disabled={isFindingPair} onClick={handleFindNewButton} title="Find New">
        {isFindingPair ? (
          <CircularProgress size={24} style={{ color: 'white' }} />
        ) : (
          <Image
            src={'/images/sidebaricons/randomchat.png'}
            width={1080 / 10}
            height={720 / 10}
            alt="icon"
            className={styles.randomIcon}
          />
        )}
      </button>

      <div className={styles.textBox}>
        <form onSubmit={handleSendButton} className={styles.textBox}>
          <input
            className={styles.textBox}
            name="messageBox"
            spellCheck="false"
            autoCorrect="false"
            placeholder={'Start typing...'}
            autoFocus
            type="text"
            id="messageBox"
            value={textValue}
            onFocus={() => setInpFocus(true)}
            autoComplete="off"
            onBlurCapture={() => setInpFocus(false)}
            onChange={(e) => setTextValue(e.target.value)}
            style={{ width: '100%' }}
            onKeyDown={(e) => {
              handleKeyDown(e);
            }}
            onBlur={() => {
              // Clear typing timeout when the input loses focus
              handleStoppedTyping(socket, typingTimeoutRef);
            }}
          ></input>
        </form>
      </div>
      <button className={`${styles.newButton} ${styles.newButton2}`} onClick={handleSendButton}>
        <IoIosSend className={styles.sendIcon} />
      </button>
    </div>
  );
};

export default InputBox;
