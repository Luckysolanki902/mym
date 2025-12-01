import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles/PhoneMockup.module.css';

// Pre-defined wave animation values (deterministic)
const WAVE_ANIMATIONS = [
  { height: 45, duration: 0.6 },
  { height: 75, duration: 0.8 },
  { height: 55, duration: 0.5 },
  { height: 85, duration: 0.7 },
  { height: 60, duration: 0.55 },
  { height: 70, duration: 0.9 },
  { height: 50, duration: 0.65 },
];

/**
 * PhoneMockup - Reusable 3D tilted phone component
 * Showcases both Text Chat and Audio Call modes
 * 
 * @param {string} mode - 'chat' | 'call' | 'auto' (auto toggles between modes)
 * @param {string} variant - 'hero' | 'signup' | 'compact'
 * @param {boolean} showToggle - Show mode toggle buttons
 * @param {boolean} autoRotate - Auto rotate between modes
 * @param {number} rotateInterval - Interval for auto rotation in ms
 * @param {string} tilt - 'left' | 'right' | 'none'
 */
const PhoneMockup = ({
  mode = 'auto',
  variant = 'hero',
  showToggle = true,
  autoRotate = true,
  rotateInterval = 5000,
  tilt = 'right',
  className = '',
  onModeChange = null
}) => {
  const [activeMode, setActiveMode] = useState(mode === 'auto' ? 'chat' : mode);
  const [callTimer, setCallTimer] = useState(0);

  console.log('PhoneMockup render:', { mode, autoRotate, rotateInterval, activeMode });

  // Sync with external mode prop when controlled (only on initial mount or when mode prop changes)
  useEffect(() => {
    if (mode !== 'auto') {
      setActiveMode(mode);
    }
  }, [mode]);

  // Auto-rotate between modes
  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      if (mode === 'auto') {
        // Uncontrolled - just update internal state
        setActiveMode(prev => prev === 'chat' ? 'call' : 'chat');
      } else {
        // Controlled - update via callback so parent state changes
        const nextMode = activeMode === 'chat' ? 'call' : 'chat';
        if (onModeChange) {
          onModeChange(nextMode);
        }
      }
    }, rotateInterval);
    
    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, mode, activeMode, onModeChange]);

  // Call timer simulation - increments when in call mode
  useEffect(() => {
    if (activeMode !== 'call') return;
    
    const timer = setInterval(() => {
      setCallTimer(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [activeMode]);

  // Reset timer when switching away from call mode
  const handleModeChange = (newMode) => {
    console.log('handleModeChange called with:', newMode, 'current activeMode:', activeMode);
    if (newMode === 'chat') {
      setCallTimer(0);
    }
    setActiveMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTiltClass = () => {
    if (tilt === 'left') return styles.tiltLeft;
    if (tilt === 'right') return styles.tiltRight;
    return '';
  };

  const getVariantClass = () => {
    if (variant === 'signup') return styles.variantSignup;
    if (variant === 'compact') return styles.variantCompact;
    return styles.variantHero;
  };

  return (
    <div className={`${styles.mockupContainer} ${getVariantClass()} ${className}`}>
      {/* Mode Toggle */}
      {showToggle && (
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${activeMode === 'chat' ? styles.modeBtnActive : ''}`}
            onClick={() => handleModeChange('chat')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Text Chat
          </button>
          <button
            className={`${styles.modeBtn} ${activeMode === 'call' ? styles.modeBtnActiveCall : ''}`}
            onClick={() => handleModeChange('call')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Audio Call
          </button>
        </div>
      )}

      {/* Phone Device */}
      <div className={`${styles.deviceWrapper} ${getTiltClass()}`}>
        {/* Glow Effect */}
        <div className={`${styles.deviceGlow} ${activeMode === 'call' ? styles.glowCyan : styles.glowPink}`} />
        
        {/* Floating Cards */}
        <motion.div 
          className={styles.floatingCard1}
          initial={{ y: 0 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        >
          <span className={styles.floatingEmoji}>🔒</span>
          <span className={styles.floatingText}>100% Anonymous</span>
        </motion.div>
        
        <motion.div 
          className={styles.floatingCard2}
          initial={{ y: 0 }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 0.5 }}
        >
          <span className={styles.floatingEmoji}>✨</span>
          <span className={styles.floatingText}>College Verified</span>
        </motion.div>

        {/* Device Frame */}
        <div className={styles.deviceFrame}>
          <div className={styles.deviceNotch} />
          <div className={styles.deviceScreen}>
            <AnimatePresence mode="wait">
              {activeMode === 'chat' ? (
                <motion.div
                  key="chat-mode"
                  className={styles.screenContent}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Chat Header */}
                  <div className={styles.chatHeader}>
                    <div className={styles.chatHeaderLeft}>
                      <span className={styles.collegeBadge}>HBTU Kanpur</span>
                      <span className={styles.onlineDot} />
                    </div>
                    <span className={styles.genderBadge}>Female</span>
                  </div>

                  {/* Chat Messages */}
                  <div className={styles.chatMessages}>
                    <div className={styles.connectedBanner}>
                      Connected with <span className={styles.genderHighlight}>a girl</span>
                    </div>

                    <motion.div 
                      className={`${styles.chatBubble} ${styles.received}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Hii! Which year? 👋
                    </motion.div>

                    <motion.div 
                      className={`${styles.chatBubble} ${styles.sent}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Hey! 3rd year CSE, you?
                    </motion.div>

                    <motion.div 
                      className={`${styles.chatBubble} ${styles.received}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      Same! This is so cool 🤩
                    </motion.div>

                    {/* Typing Indicator */}
                    <motion.div 
                      className={styles.typingIndicator}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <span className={styles.typingText}>She is typing</span>
                      <div className={styles.typingDots}>
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className={styles.typingDot}
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Chat Input */}
                  <div className={styles.chatInputArea}>
                    <div className={styles.chatInput}>Type a message...</div>
                    <div className={styles.sendBtn}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="call-mode"
                  className={styles.callScreen}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Call Header */}
                  <div className={styles.callHeader}>
                    <div className={styles.callStatus}>
                      <span className={styles.callDot} />
                      <span>On Call</span>
                    </div>
                    <span className={styles.genderBadgeCyan}>Male</span>
                  </div>

                  {/* Call Center */}
                  <div className={styles.callCenter}>
                    {/* Avatar with Pulse Ring */}
                    <div className={styles.avatarContainer}>
                      <motion.div
                        className={styles.pulseRing1}
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                      />
                      <motion.div
                        className={styles.pulseRing2}
                        initial={{ scale: 1, opacity: 0.3 }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "loop", delay: 0.5 }}
                      />
                      <div className={styles.avatarRing}>
                        <div className={styles.avatar}>👤</div>
                      </div>
                    </div>

                    {/* Caller Info */}
                    <div className={styles.callerInfo}>
                      <span className={styles.callerLabel}>Connected with</span>
                      <span className={styles.callerGender}>a boy</span>
                    </div>

                    {/* Call Timer */}
                    <div className={styles.timerCard}>
                      <motion.div
                        className={styles.timerDot}
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                      />
                      <span className={styles.timerDisplay}>{formatTime(callTimer)}</span>
                    </div>

                    {/* Audio Wave */}
                    <div className={styles.audioWave}>
                      {WAVE_ANIMATIONS.map((wave, i) => (
                        <motion.div
                          key={i}
                          className={styles.waveBar}
                          initial={{ height: '30%' }}
                          animate={{
                            height: ['30%', `${wave.height}%`, '30%']
                          }}
                          transition={{
                            duration: wave.duration,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut",
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Call Controls */}
                  <div className={styles.callControls}>
                    <button className={styles.controlBtn}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                      </svg>
                    </button>
                    <button className={styles.endCallBtn}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
                      </svg>
                    </button>
                    <button className={styles.controlBtn}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
