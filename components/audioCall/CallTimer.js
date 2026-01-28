import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './styles/CallTimer.module.css';
import { useAudioCall } from '@/context/AudioCallContext';

// Pre-defined wave animation values (deterministic for smooth animation)
const WAVE_ANIMATIONS = [
  { height: 45, duration: 0.6 },
  { height: 75, duration: 0.8 },
  { height: 55, duration: 0.5 },
  { height: 85, duration: 0.7 },
  { height: 60, duration: 0.55 },
  { height: 70, duration: 0.9 },
  { height: 50, duration: 0.65 },
];

const CallTimer = ({ startTime, userGender }) => {
  const [elapsed, setElapsed] = useState(0);
  const { partner } = useAudioCall();
  const partnerGender = partner?.gender;

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
    male: { primary: '#4FC3F7', secondary: '#29B6F6', glow: 'rgba(79, 195, 247, 0.3)', bg: 'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%)' },
    female: { primary: '#FF6BA0', secondary: '#EC407A', glow: 'rgba(255, 107, 160, 0.3)', bg: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD9 100%)' }
  };
  
  const theme = genderTheme[partnerGender] || genderTheme.male;
  const displayGender = partnerGender === 'female' ? 'A Girl' : 'A Boy';

  return (
    <motion.div
      className={styles.timerContainer}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      {/* Connected Info */}
      <div className={styles.connectedInfo}>
        <span className={styles.connectedLabel}>Connected with</span>
        <div className={styles.connectedRow}>
          <span className={styles.connectedGender} style={{ color: theme.primary }}>{displayGender}</span>
          {partner?.isVerified && (
            <span className={styles.verifiedCheckmark}>
              <Image 
                src="/app-icons/icons/verified.png" 
                width={22} 
                height={22} 
                alt="verified"
              />
            </span>
          )}
        </div>
        {partner?.matchQuality && (
          <span className={styles.collegeInfo}>
            {partner.matchQuality.preferencesMet ? 'from your college' : 'Not from your college'}
          </span>
        )}
      </div>

      {/* Timer Card */}
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

      {/* Audio Wave Animation */}
      <div className={styles.audioWave}>
        {WAVE_ANIMATIONS.map((wave, i) => (
          <motion.div
            key={i}
            className={styles.waveBar}
            style={{ background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}
            animate={{
              height: ['30%', `${wave.height}%`, '30%']
            }}
            transition={{
              duration: wave.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default CallTimer;
