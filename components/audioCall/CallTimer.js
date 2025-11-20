import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './styles/CallTimer.module.css';

const CallTimer = ({ startTime, userGender }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const genderTheme = {
    male: { primary: '#79EAF7', glow: 'rgba(121, 234, 247, 0.3)' },
    female: { primary: '#FFA0BC', glow: 'rgba(255, 160, 188, 0.3)' }
  };
  
  const theme = genderTheme[userGender] || genderTheme.male;

  return (
    <motion.div
      className={styles.timerContainer}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.timerCard}>
        <motion.div
          className={styles.pulseDot}
          style={{ backgroundColor: theme.primary }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div 
          className={styles.timeDisplay}
          style={{ color: theme.primary }}
        >
          {formatTime(elapsed)}
        </div>
      </div>
      <div className={styles.callLabel}>
        On call
      </div>
    </motion.div>
  );
};

export default CallTimer;
