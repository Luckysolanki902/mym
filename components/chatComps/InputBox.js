import React, { useEffect, useRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Image from 'next/image';
import { IoIosSend } from 'react-icons/io';
import styles from '../componentStyles/textchat.module.css';
import { useMediaQuery } from '@mui/material';
import { useTextChat } from '@/context/TextChatContext';

const InputBox = ({
  handleFindNewButton,
  handleSendButton,
  textValue,
  setTextValue,
  inpFocus,
  setInpFocus,
  handleKeyDown,
  handleStoppedTyping,
  typingTimeoutRef,
  inputRef,
  userDetails,
}) => {
  const { isFindingPair, socket, hasPaired } = useTextChat();
  const isSmallScreen = useMediaQuery('(max-width:800px)');
  const messagesContainerRef = useRef(null);

  // Scroll to the bottom when inpFocus changes
  useEffect(() => {
    if (inpFocus && messagesContainerRef.current) {
      messagesContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [inpFocus, textValue]);

  return (
    <div className={styles.inputContainerMainDiv} ref={inputRef}>
      <div className={`${styles.inputContainer} ${inpFocus ? styles.inpFocus : ''}`}>
        <button className={styles.newButton} onClick={handleFindNewButton} title={!isFindingPair ? 'Find New' : 'Stop'}>
          {isFindingPair && !hasPaired ? (
            <CircularProgress size={24} style={{ color: isSmallScreen ? 'black' : 'white' }} />
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
          <form onSubmit={handleSendButton}>
            <input
              className={`${styles.textBox} ${styles.input}`}
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
              onKeyDown={(e) => handleKeyDown(e)}
              onBlur={() => handleStoppedTyping(socket, typingTimeoutRef, userDetails, hasPaired)}
              onClick={() => {
                if (messagesContainerRef.current) {
                  messagesContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            />
          </form>
        </div>
        {/* <button className={`${styles.newButton} ${styles.newButton2}`} onClick={handleSendButton}>
          <IoIosSend className={styles.sendIcon} />
          <div className={styles.sendTextIcon}>Send</div>
        </button> */}
      </div>
      {/* This div is used to scroll to the bottom */}
      <div ref={messagesContainerRef} />
    </div>
  );
};

export default InputBox;
