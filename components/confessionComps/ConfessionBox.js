// components/confessionComps/ConfessionBox.js

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '../componentStyles/confession.module.css';
import { useInView } from 'react-intersection-observer'; // Import the useInView hook
import ReplyIcon from '@mui/icons-material/Reply';
import ShareDialog from '../dialogs/ShareDialog';
import { Button } from '@mui/material';
import ConfessionFooter from './ConfessionFooter';

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

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const confessionDate = new Date(timestamp);

    const seconds = Math.floor((now - confessionDate) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
      return `A few seconds ago`;
    } else if (minutes < 60) {
      if (minutes === 1) {
        return `A minute ago`;
      } else if (minutes === 2) {
        return `2 minutes ago`;
      } else if (minutes === 3) {
        return `3 minutes ago`;
      } else {
        return `A few minutes ago`;
      }
    } else if (hours < 24) {
      if (hours === 1) {
        return `An hour ago`;
      } else if (hours === 2) {
        return `2 hours ago`;
      } else if (hours === 3) {
        return `3 hours ago`;
      } else {
        return `A few hours ago`;
      }
    } else if (days < 7) {
      if (days === 1) {
        return `A day ago`;
      } else if (days === 2) {
        return `2 days ago`;
      } else if (days === 3) {
        return `3 days ago`;
      } else {
        return `A few days ago`;
      }
    } else if (weeks < 4) {
      if (weeks === 1) {
        return `A week ago`;
      } else if (weeks === 2) {
        return `2 weeks ago`;
      } else if (weeks === 3) {
        return `3 weeks ago`;
      } else {
        return `A few weeks ago`;
      }
    } else if (months < 12) {
      if (months === 1) {
        return `A month ago`;
      } else if (months === 2) {
        return `2 months ago`;
      } else if (months === 3) {
        return `3 months ago`;
      } else {
        return `A few months ago`;
      }
    } else {
      if (years === 1) {
        return `A year ago`;
      } else if (years === 2) {
        return `2 years ago`;
      } else if (years === 3) {
        return `3 years ago`;
      } else {
        return `A few years ago`;
      }
    }
  };


  return (
    <>
      <div ref={ref} style={{ position: 'relative' }} className={`${styles.mainContainer} ${gender && applyGenderBasedGrandients ? styles[`${gender}Gradient`] : ''}`}
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
      </div>



    </>
  );
};

export default ConfessionBox;
