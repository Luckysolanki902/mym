import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../componentStyles/confession.module.css';
import { useInView } from 'react-intersection-observer'; // Import the useInView hook

const ConfessionBox = ({ gender, applyGenderBasedGrandients, confession }) => {
  const [content, setContent] = useState('');
  const [index, setIndex] = useState(0);
  const [canshowTypingEffect, setCanShowTypingEffect] = useState(true)
  const [showCaret, setShowCaret] = useState(true);
  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  const handleComplete = () =>{
    setCanShowTypingEffect(false)
    setShowCaret(false); 
  }
  

  useEffect(() => {
    if (inView && canshowTypingEffect) {
      const timer = setTimeout(() => {
        if (index < confession.confessionContent.length) {
          setContent(prevContent => prevContent + confession.confessionContent.charAt(index));
          setIndex(prevIndex => prevIndex + 1);
        } else {
          setShowCaret(prevShowCaret => !prevShowCaret); // Toggle caret visibility
          handleComplete();
        }
      }, 40); // Adjust the speed here

      return () => clearTimeout(timer);
    }
  }, [index, inView, confession.confessionContent.length]);

  return (
    <div ref={ref} className={`${styles.mainContainer} ${gender && applyGenderBasedGrandients ? styles[`${gender}Gradient`] : ''}`} onClick={handleComplete}>
      <div className={styles.textarea} style={{ whiteSpace: 'pre-line' }}>
        {inView ? (
          <>
            <span>{content}</span>
            {showCaret && <span style={{ animation: '1s step-end infinite blink-caret', fontStyle:'italic' }}> |</span>}
          </>
        ) : (
          <span>{confession.confessionContent}</span>
        )}
      </div>
      <div style={{ textAlign: 'right', margin: '1rem 0' }} className={styles.masks}>
        <Image src={'/images/othericons/masks.png'} width={512} height={512} alt='' />
      </div>
    </div>
  );
};

export default ConfessionBox;
