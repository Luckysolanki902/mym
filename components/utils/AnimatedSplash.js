// Animated Splash Screen Component
// Shows a beautiful "spill" animation for SPYLL branding

import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import styles from './AnimatedSplash.module.css';

const AnimatedSplash = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('spilling'); // Start spilling immediately
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasHiddenNativeSplash = useRef(false);

  useEffect(() => {
    // Hide native splash immediately when component mounts
    const hideNativeSplash = async () => {
      if (Capacitor.isNativePlatform() && !hasHiddenNativeSplash.current) {
        hasHiddenNativeSplash.current = true;
        try {
          // Hide with no fade - our animated splash is already showing
          await SplashScreen.hide({ fadeOutDuration: 0 });
          console.log('[Splash] Native splash hidden');
        } catch (e) {
          console.log('[Splash] Error hiding native splash:', e);
        }
      }
    };
    hideNativeSplash();

    // Animation timing
    const timer1 = setTimeout(() => {
      setAnimationPhase('complete');
    }, 1000); // Letters finish animating

    const timer2 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1400); // Start fade out

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1900); // Complete fade and call onComplete

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.splashContainer} ${isFadingOut ? styles.fadeOut : ''}`}>
      <div className={styles.logoContainer}>
        {/* Each letter animates with a "spill" effect */}
        <span className={`${styles.letter} ${styles.letterS} ${styles.spill}`}>S</span>
        <span className={`${styles.letter} ${styles.letterP} ${styles.spill}`}>P</span>
        <span className={`${styles.letter} ${styles.letterY} ${styles.spill}`}>Y</span>
        <span className={`${styles.letter} ${styles.letterL} ${styles.spill}`}>L</span>
        <span className={`${styles.letter} ${styles.letterL2} ${styles.spill}`}>L</span>
      </div>
      
      {/* Spill droplet effect */}
      <div className={`${styles.droplet} ${styles.dropletAnimate}`} />
    </div>
  );
};

export default AnimatedSplash;
