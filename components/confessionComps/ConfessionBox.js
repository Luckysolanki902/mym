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
  const [canshowTypingEffect, setCanShowTypingEffect] = useState(true)
  const [showCaret, setShowCaret] = useState(true);
  const [isShareDialogOpen, setShareDialogOpen] = useState(false); // State to manage ShareDialog visibility

  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  const confessionBoxRef = useRef(null)

  const handleComplete = () => {
    setCanShowTypingEffect(false)
    setShowCaret(false);
  }

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
      }, 40); // Adjust the speed here

      return () => clearTimeout(timer);
    }
  }, [index, inView, confession.confessionContent.length, content]);

  return (
    <div ref={ref} style={{ position: 'relative' }} className={`${styles.mainContainer} ${gender && applyGenderBasedGrandients ? styles[`${gender}aGradient`] : ''}`} onClick={handleComplete}>
      <Button color='primary' style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
        <ReplyIcon onClick={handleShareClick} style={{ transform: 'scaleX(-1)', color: 'white' }} className={styles.shareIcon} />
      </Button>
      <div className={styles.textarea} style={{ whiteSpace: 'pre-line' }} ref={confessionBoxRef}>
        {inView ? (
          <>
            <span>{content}</span>
            {showCaret && <span style={{ animation: '1s step-end infinite blink-caret', fontStyle: 'italic' }}> |</span>}
          </>
        ) : (
          <span>{confession.confessionContent}</span>
        )}
      </div>
      <div style={{ textAlign: 'right', margin: '1rem 0' }} className={styles.masks}>
        <Image src={'/images/othericons/masks.png'} width={512} height={512} alt='' />
      </div>
      <ShareDialog open={isShareDialogOpen} shareLink={confession._id} onClose={() => setShareDialogOpen(false)} />
    </div>
  );
};

export default ConfessionBox;
