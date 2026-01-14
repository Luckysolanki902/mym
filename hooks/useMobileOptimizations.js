/**
 * Mobile Performance Optimizations Hook
 * Provides smooth scrolling, touch handling, and performance optimizations for Android/iOS
 */

import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Detects if the app is running inside Capacitor native shell
 */
export const isNativeApp = () => {
  if (typeof window === 'undefined') return false;
  return window.Capacitor?.isNativePlatform?.() || false;
};

/**
 * Detects if device is mobile (iOS or Android)
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Hook to optimize scroll performance on mobile devices
 */
export const useOptimizedScroll = (ref) => {
  useEffect(() => {
    if (!ref?.current || typeof window === 'undefined') return;
    
    const element = ref.current;
    
    // Enable momentum scrolling on iOS
    element.style.webkitOverflowScrolling = 'touch';
    element.style.overflowY = 'auto';
    
    // Use passive listeners for better performance
    const options = { passive: true };
    
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Scroll logic here if needed
          ticking = false;
        });
        ticking = true;
      }
    };
    
    element.addEventListener('scroll', handleScroll, options);
    
    return () => {
      element.removeEventListener('scroll', handleScroll, options);
    };
  }, [ref]);
};

/**
 * Hook to prevent overscroll/bounce on mobile
 */
export const usePreventOverscroll = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !isMobileDevice()) return;
    
    // Prevent pull-to-refresh on mobile
    let lastTouchY = 0;
    
    const handleTouchStart = (e) => {
      lastTouchY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      const touchYDelta = touchY - lastTouchY;
      
      // If at top of page and trying to scroll up, prevent
      if (window.scrollY === 0 && touchYDelta > 0) {
        // Allow if inside a scrollable element
        const target = e.target;
        if (target.closest('[data-scrollable="true"]')) return;
        
        // Only prevent on body scroll
        if (e.cancelable) {
          e.preventDefault();
        }
      }
      
      lastTouchY = touchY;
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
};

/**
 * Hook to add GPU acceleration hints for smoother animations
 */
export const useGPUAcceleration = (ref) => {
  useEffect(() => {
    if (!ref?.current) return;
    
    const element = ref.current;
    
    // Add GPU acceleration hints
    element.style.transform = 'translateZ(0)';
    element.style.backfaceVisibility = 'hidden';
    element.style.willChange = 'transform, opacity';
    
    return () => {
      element.style.willChange = 'auto';
    };
  }, [ref]);
};

/**
 * Debounce function for performance
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
};

/**
 * Hook to throttle rapid state updates
 */
export const useThrottledState = (initialValue, delay = 16) => {
  const [value, setValue] = useState(initialValue);
  const lastUpdate = useRef(Date.now());
  const pendingValue = useRef(initialValue);
  const rafId = useRef(null);
  
  const setThrottledValue = useCallback((newValue) => {
    pendingValue.current = newValue;
    
    const now = Date.now();
    if (now - lastUpdate.current >= delay) {
      lastUpdate.current = now;
      setValue(newValue);
    } else if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        setValue(pendingValue.current);
        lastUpdate.current = Date.now();
        rafId.current = null;
      });
    }
  }, [delay]);
  
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);
  
  return [value, setThrottledValue];
};

/**
 * Main hook that applies all mobile optimizations
 */
const useMobileOptimizations = () => {
  // usePreventOverscroll disabled - was blocking normal scroll behavior
  // usePreventOverscroll();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Add class to body for mobile-specific CSS
    if (isMobileDevice()) {
      document.body.classList.add('is-mobile');
    }
    if (isNativeApp()) {
      document.body.classList.add('is-native-app');
    }
    
    // Disable text selection on double tap (prevents zoom issues)
    const handleTouchEnd = (e) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      
      if (window._lastTouchEnd && (now - window._lastTouchEnd) < DOUBLE_TAP_DELAY) {
        e.preventDefault();
      }
      window._lastTouchEnd = now;
    };
    
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Set viewport meta for better mobile rendering
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
    
    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.classList.remove('is-mobile', 'is-native-app');
    };
  }, []);
};

export default useMobileOptimizations;
