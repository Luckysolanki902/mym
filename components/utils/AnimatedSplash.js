// Animated Splash Screen Component
// Shows a beautiful "spill" animation for SPYLL branding

import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import styles from './AnimatedSplash.module.css';

const AnimatedSplash = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('initial'); // initial, spilling, complete
  const hasHiddenNativeSplash = useRef(false);

  useEffect(() => {
    // Small delay to ensure component is mounted and rendered
    // before hiding native splash
    const mountDelay = setTimeout(async () => {
      if (Capacitor.isNativePlatform() && !hasHiddenNativeSplash.current) {
        hasHiddenNativeSplash.current = true;
        try {
          await SplashScreen.hide({ fadeOutDuration: 200 });
          console.log('[Splash] Native splash hidden');
        } catch (e) {
          console.log('[Splash] Error hiding native splash:', e);
        }
      }
      
      // Start spill animation after native splash is hidden
      setAnimationPhase('spilling');
    }, 50); // Small delay to ensure DOM is ready

    const timer2 = setTimeout(() => {
      setAnimationPhase('complete');
    }, 1200);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1800);

    return () => {
      clearTimeout(mountDelay);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.splashContainer} ${animationPhase === 'complete' ? styles.fadeOut : ''}`}>
      <div className={styles.logoContainer}>
        {/* Each letter animates with a "spill" effect */}
        <span className={`${styles.letter} ${styles.letterS} ${animationPhase !== 'initial' ? styles.spill : ''}`}>S</span>
        <span className={`${styles.letter} ${styles.letterP} ${animationPhase !== 'initial' ? styles.spill : ''}`}>P</span>
        <span className={`${styles.letter} ${styles.letterY} ${animationPhase !== 'initial' ? styles.spill : ''}`}>Y</span>
        <span className={`${styles.letter} ${styles.letterL} ${animationPhase !== 'initial' ? styles.spill : ''}`}>L</span>
        <span className={`${styles.letter} ${styles.letterL2} ${animationPhase !== 'initial' ? styles.spill : ''}`}>L</span>
      </div>
      
      {/* Spill droplet effect */}
      <div className={`${styles.droplet} ${animationPhase !== 'initial' ? styles.dropletAnimate : ''}`} />
    </div>
  );
};

export default AnimatedSplash;
