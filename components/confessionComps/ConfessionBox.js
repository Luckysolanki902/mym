import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '../componentStyles/confession.module.css';
import { useInView } from 'react-intersection-observer'; // Import the useInView hook
import ReplyIcon from '@mui/icons-material/Reply';
import ShareDialog from '../dialogs/ShareDialog';
import { Button } from '@mui/material';

const ConfessionBox = ({ gender, applyGenderBasedGrandients, confession }) => {
  const [content, setContent] = useState('');
  const [index, setIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showCaret, setShowCaret] = useState(true);
  const [isShareDialogOpen, setShareDialogOpen] = useState(false); // State to manage ShareDialog visibility
  const [showFullContent, setShowFullContent] = useState(false);
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

  const handleBoxClick = () => {
    setShowFullContent(true);
    handleComplete();
  };

  useEffect(() => {
    if (inView && isTyping && !showFullContent) {
      const timer = setTimeout(() => {
        if (index < confession.confessionContent.length) {
          setContent(prevContent => prevContent + confession.confessionContent.charAt(index));
          setIndex(prevIndex => prevIndex + 1);
          confessionBoxRef.current.scrollTop = confessionBoxRef.current.scrollHeight; // Scroll to the bottom
        } else {
          setShowCaret(prevShowCaret => !prevShowCaret); // Toggle caret visibility
          handleComplete();
        }
      }, 40);

      return () => clearTimeout(timer);
    }
  }, [index, inView, isTyping, showFullContent, confession.confessionContent.length]);

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
      return `a few seconds ago`;
    } else if (minutes < 60) {
      if (minutes === 1) {
        return `a minute ago`;
      } else if (minutes === 2) {
        return `2 minutes ago`;
      } else if (minutes === 3) {
        return `3 minutes ago`;
      } else {
        return `a few minutes ago`;
      }
    } else if (hours < 24) {
      if (hours === 1) {
        return `an hour ago`;
      } else if (hours === 2) {
        return `2 hours ago`;
      } else if (hours === 3) {
        return `3 hours ago`;
      } else {
        return `a few hours ago`;
      }
    } else if (days < 7) {
      if (days === 1) {
        return `a day ago`;
      } else if (days === 2) {
        return `2 days ago`;
      } else if (days === 3) {
        return `3 days ago`;
      } else {
        return `a few days ago`;
      }
    } else if (weeks < 4) {
      if (weeks === 1) {
        return `a week ago`;
      } else if (weeks === 2) {
        return `2 weeks ago`;
      } else if (weeks === 3) {
        return `3 weeks ago`;
      } else {
        return `a few weeks ago`;
      }
    } else if (months < 12) {
      if (months === 1) {
        return `a month ago`;
      } else if (months === 2) {
        return `2 months ago`;
      } else if (months === 3) {
        return `3 months ago`;
      } else {
        return `a few months ago`;
      }
    } else {
      if (years === 1) {
        return `a year ago`;
      } else if (years === 2) {
        return `2 years ago`;
      } else if (years === 3) {
        return `3 years ago`;
      } else {
        return `a few years ago`;
      }
    }
  };
  

  return (
    <div ref={ref} style={{ position: 'relative' }} className={`${styles.mainContainer} ${gender && applyGenderBasedGrandients ? styles[`${gender}Gradient`] : ''}`} onClick={handleBoxClick}>
      <Button color='primary' style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
        <ReplyIcon onClick={handleShareClick} style={{ transform: 'scaleX(-1)', color: 'white' }} className={styles.shareIcon} />
      </Button>
      <div onClick={handleBoxClick} className={styles.textarea} style={{ whiteSpace: 'pre-line' }} ref={confessionBoxRef}>
        {inView ? (
          <>
            <span>{showFullContent ? confession.confessionContent : content}</span>
            {showCaret && <span style={{ animation: '1s step-end infinite blink-caret', fontStyle: 'italic' }}> |</span>}
          </>
        ) : (
          <span>{confession.confessionContent}</span>
        )}
      </div>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', width:'100%'}}>

      <div style={{ fontSize: '0.8rem', fontFamily: 'Roboto', fontWeight: '100', color: 'white', opacity: '0.8', display:'flex', flexDirection:'column' }}>
        <div>
        confessed {getTimeAgo(confession.timestamps)}
        </div>
        <div>From {confession?.college}</div>
      </div>

      <div style={{ textAlign: 'right', margin: '0' }} className={styles.masks}>
        <Image onClick={handleBoxClick} src={'/images/othericons/masks.png'} width={512} height={512} alt='' />
      </div>

      </div>
      <ShareDialog open={isShareDialogOpen} shareLink={confession._id} onClose={() => setShareDialogOpen(false)} />
    </div>
  );
};

export default ConfessionBox;
