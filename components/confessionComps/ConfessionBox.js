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
  const [canshowTypingEffect, setCanShowTypingEffect] = useState(true);
  const [showCaret, setShowCaret] = useState(true);
  const [isShareDialogOpen, setShareDialogOpen] = useState(false); // State to manage ShareDialog visibility
  const [showFullContent, setShowFullContent] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  const confessionBoxRef = useRef(null);

  const handleComplete = () => {
    setCanShowTypingEffect(false);
    setShowCaret(false);
  };

  const handleShareClick = () => {
    // Open the ShareDialog when the share icon is clicked
    setShareDialogOpen(true);
  };

  useEffect(() => {
    const confessionBox = confessionBoxRef.current;
    if (inView && canshowTypingEffect) {
      const timer = setTimeout(() => {
        if (index < confession.confessionContent.length) {
          setContent(prevContent => prevContent + confession.confessionContent.charAt(index));
          setIndex(prevIndex => prevIndex + 1);
          confessionBox.scrollTop = confessionBox.scrollHeight; // Scroll to the bottom
        } else {
          setShowCaret(prevShowCaret => !prevShowCaret); // Toggle caret visibility
          handleComplete();
        }
      }, 40);

      return () => clearTimeout(timer);
    }
  }, [index, inView, confession.confessionContent.length, content]);


  
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
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  } else if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  } else {
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }
};


  return (
    <div ref={ref} style={{ position: 'relative' }} className={`${styles.mainContainer} ${gender && applyGenderBasedGrandients ? styles[`${gender}Gradient`] : ''}`} onClick={handleComplete}>
      <Button color='primary' style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
        <ReplyIcon onClick={handleShareClick} style={{ transform: 'scaleX(-1)', color: 'white' }} className={styles.shareIcon} />
      </Button>
      <div onClick={() => setShowFullContent(true)} className={styles.textarea} style={{ whiteSpace: 'pre-line' }} ref={confessionBoxRef}>
        {inView && !showFullContent ? (
          <>
            <span>{content}</span>
            {showCaret && <span style={{ animation: '1s step-end infinite blink-caret', fontStyle: 'italic' }}> |</span>}
          </>
        ) : (
          <span>{confession.confessionContent}</span>
        )}
      </div>
      <div style={{ textAlign: 'right', margin: '1rem 0' }} className={styles.masks}>
        <Image onClick={() => setShowFullContent(true)} src={'/images/othericons/masks.png'} width={512} height={512} alt='' />
      </div>
      <div style={{fontSize:'0.8rem', fontFamily:'Roboto', fontWeight:'100', color:'white', opacity:'0.8'}}>
        confessed {getTimeAgo(confession.timestamps)}
      </div>
      <ShareDialog open={isShareDialogOpen} shareLink={confession._id} onClose={() => setShareDialogOpen(false)} />
    </div>
  );
};

export default ConfessionBox;
