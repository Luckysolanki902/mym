// ConfessionBox.js
import React,{useState} from 'react';
import Image from 'next/image';
import Typewriter from 'typewriter-effect';
import styles from '../componentStyles/confession.module.css';
import { useInView } from 'react-intersection-observer'; // Import the useInView hook

const ConfessionBox = ({ gender, applyGenderBasedGrandients, confession }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
  });
  const [delay, setDelay] = useState(40);

  return (
    <div ref={ref} className={`${styles.mainContainer} ${gender && applyGenderBasedGrandients ? styles[`${gender}Gradient`] : ''}`} onClick={() => setDelay(0)}>
      <div className={styles.textarea} style={{ whiteSpace: 'pre-line' }}>
        {inView ? (
          <Typewriter
            options={{
              strings: [confession.confessionContent],
              autoStart: true,
              loop: false,
              delay: delay,
              deleteSpeed: 20,
              pauseFor: 150000,
            }}
          />
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
