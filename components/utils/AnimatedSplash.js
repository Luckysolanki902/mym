// Animated Splash Screen Component
// Shows a beautiful "spill" animation for SPYLL branding

import { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import styles from './AnimatedSplash.module.css';

const AnimatedSplash = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasHiddenNativeSplash = useRef(false);
  const timersRef = useRef([]);

  // Check if Liquids font is loaded
  const checkFontLoaded = useCallback(async () => {
    try {
      // Use the Font Loading API to check if Liquids font is ready
      if (document.fonts && document.fonts.check) {
        // Try to load the font explicitly
        await document.fonts.load('1em Liquids');
        const isLoaded = document.fonts.check('1em Liquids');
        if (isLoaded) {
          setFontLoaded(true);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.log('[Splash] Font check error:', e);
      // Fallback: assume font is loaded after a brief wait
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initSplash = async () => {
      // First, ensure font is loaded before doing anything
      let fontReady = await checkFontLoaded();
      
      // If font API check failed, try waiting for fonts.ready
      if (!fontReady && document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
          fontReady = await checkFontLoaded();
        } catch (e) {
          console.log('[Splash] fonts.ready error:', e);
        }
      }

      // Fallback: if still not detected, wait a bit and proceed
      if (!fontReady) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      if (!mounted) return;
      setFontLoaded(true);

      // NOW hide native splash - only after font is confirmed loaded
      if (Capacitor.isNativePlatform() && !hasHiddenNativeSplash.current) {
        hasHiddenNativeSplash.current = true;
        try {
          await SplashScreen.hide({ fadeOutDuration: 0 });
          console.log('[Splash] Native splash hidden');
        } catch (e) {
          console.log('[Splash] Error hiding native splash:', e);
        }
      }

      // Start animation after a tiny delay to ensure render
      requestAnimationFrame(() => {
        if (mounted) {
          setAnimationStarted(true);
        }
      });
    };

    initSplash();

    return () => {
      mounted = false;
    };
  }, [checkFontLoaded]);

  // Handle animation timers - only start when animation has begun
  useEffect(() => {
    if (!animationStarted) return;

    // Animation timing
    const timer1 = setTimeout(() => {
      // Animation phase complete (letters finished)
    }, 1000);

    const timer2 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1400);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1900);

    timersRef.current = [timer1, timer2, timer3];

    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, [animationStarted, onComplete]);

  if (!isVisible) return null;

  // Don't render letters until font is loaded to prevent FOUT
  const showLetters = fontLoaded && animationStarted;

  return (
    <div className={`${styles.splashContainer} ${isFadingOut ? styles.fadeOut : ''}`}>
      <div className={styles.logoContainer}>
        {/* Each letter animates with a "spill" effect - only show when font is loaded */}
        {showLetters && (
          <>
            <span className={`${styles.letter} ${styles.letterS} ${styles.spill}`}>S</span>
            <span className={`${styles.letter} ${styles.letterP} ${styles.spill}`}>P</span>
            <span className={`${styles.letter} ${styles.letterY} ${styles.spill}`}>Y</span>
            <span className={`${styles.letter} ${styles.letterL} ${styles.spill}`}>L</span>
            <span className={`${styles.letter} ${styles.letterL2} ${styles.spill}`}>L</span>
          </>
        )}
      </div>
      
      {/* Spill droplet effect - only show when animation started */}
      {showLetters && <div className={`${styles.droplet} ${styles.dropletAnimate}`} />}
    </div>
  );
};

export default AnimatedSplash;
