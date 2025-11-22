// components/confessionComps/ConfessionBox.js

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '../componentStyles/confession.module.css';
import { useInView } from 'react-intersection-observer'; // Import the useInView hook
import ReplyIcon from '@mui/icons-material/Reply';
import ShareDialog from '../dialogs/ShareDialog';
import { Button } from '@mui/material';
import ConfessionFooter from './ConfessionFooter';
import { getTimeAgo } from '../../utils/generalUtilities';
import { motion } from 'framer-motion';

const ConfessionBox = ({ gender, applyGenderBasedGrandients, confession, userDetails, commentsCount, toggleCommentsDialog, handleClick, handleOpenAuthPrompt, isAdmin, ondeleteClick }) => {
  // const [content, setContent] = useState('');
  // const [index, setIndex] = useState(0);
  // const [isTyping, setIsTyping] = useState(true);
  // const [showCaret, setShowCaret] = useState(true);
  const [isShareDialogOpen, setShareDialogOpen] = useState(false); // State to manage ShareDialog visibility
  // const [showFullContent, setShowFullContent] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  const confessionBoxRef = useRef(null);

  const handleComplete = () => {
    setIsTyping(false);
    setShowCaret(false);
    setContent(confession.confessionContent);
  };

  const handleShareClick = () => {
    // Open the ShareDialog when the share icon is clicked
    setShareDialogOpen(true);
  };

  // const handleBoxClick = () => {
  //   setShowFullContent(true);
  //   handleComplete();
  // };

  // useEffect(() => {
  //   if (inView && isTyping && !showFullContent) {
  //     const timer = setTimeout(() => {
  //       if (index < confession?.confessionContent?.length) {
  //         setContent(prevContent => prevContent + confession.confessionContent.charAt(index));
  //         setIndex(prevIndex => prevIndex + 1);
  //         confessionBoxRef.current.scrollTop = confessionBoxRef.current.scrollHeight; // Scroll to the bottom
  //       } else {
  //         setShowCaret(prevShowCaret => !prevShowCaret); // Toggle caret visibility
  //         handleComplete();
  //       }
  //     }, 40);

  //     return () => clearTimeout(timer);
  //   }
  // }, [index, inView, isTyping, showFullContent, confession?.confessionContent?.length]);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        ref={ref} 
        style={{ position: 'relative' }} 
        className={`${styles.mainContainer} ${gender && applyGenderBasedGrandients ? styles[`${gender}Card`] : ''}`}
      //  onClick={handleBoxClick}
       >
        <div 
        // onClick={handleBoxClick}
         className={styles.textarea} style={{ whiteSpace: 'pre-line' }} ref={confessionBoxRef}>
          {/* {inView ? (
            <>
              <span>{showFullContent ? confession.confessionContent : content}</span>
              {showCaret && <span style={{ animation: '1s step-end infinite blink-caret' }}> |</span>}
            </>
          ) : (
            <span>{confession.confessionContent}</span>
          )} */}

          <span>{confession.confessionContent}</span>

        </div>

        <div className={styles.timestamp}>
          <div style={{ fontSize: '0.7rem', color: 'rgb(120, 120, 120)' }}>
            {getTimeAgo(confession.createdAt)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgb(120, 120, 120)' }}>From {confession?.college}</div>
        </div>

        <ConfessionFooter
          confession={confession}
          userDetails={userDetails}
          commentsCount={commentsCount}
          toggleCommentsDialog={toggleCommentsDialog}
          handleClick={handleClick}
          handleOpenAuthPrompt={handleOpenAuthPrompt}
          isAdmin={isAdmin}
          handleShareClick={handleShareClick}
        />







        <ShareDialog open={isShareDialogOpen} shareLink={confession._id} onClose={() => setShareDialogOpen(false)} confessorGender={confession?.gender} />
      </motion.div>



    </>
  );
};

export default ConfessionBox;
