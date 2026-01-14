import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import styles from './PullToRefresh.module.css';

/**
 * Pull-to-Refresh Component
 * Only works on mobile (Android/iOS via Capacitor), disabled on web
 * Usage: Wrap your page content with <PullToRefresh onRefresh={handleRefresh}>
 */
const PullToRefresh = ({ children, onRefresh, disabled = false }) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isMobile = Capacitor.isNativePlatform();

  const maxPullDistance = 120;
  const refreshThreshold = 80;

  useEffect(() => {
    // Only enable on mobile platforms
    if (!isMobile || disabled) return;

    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let isScrolledToTop = false;

    const handleTouchStart = (e) => {
      // Check if user is at the top of the page
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      isScrolledToTop = scrollTop === 0;

      if (isScrolledToTop && !refreshing) {
        touchStartY = e.touches[0].clientY;
        startY.current = touchStartY;
      }
    };

    const handleTouchMove = (e) => {
      if (!isScrolledToTop || refreshing) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      // Only pull down (positive distance) and when at top
      if (distance > 0) {
        // Prevent default scroll behavior when pulling down
        if (distance > 10) {
          e.preventDefault();
        }

        // Apply resistance: the further you pull, the slower it moves
        const resistance = 0.5;
        const adjustedDistance = Math.min(distance * resistance, maxPullDistance);
        
        setPullDistance(adjustedDistance);
        setPulling(true);
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling || refreshing) return;

      if (pullDistance >= refreshThreshold) {
        // Trigger refresh
        setRefreshing(true);
        setPullDistance(refreshThreshold); // Lock at threshold during refresh

        try {
          if (onRefresh) {
            await onRefresh();
          }
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          // Wait a bit for smooth animation
          setTimeout(() => {
            setRefreshing(false);
            setPullDistance(0);
            setPulling(false);
          }, 300);
        }
      } else {
        // Snap back
        setPullDistance(0);
        setPulling(false);
      }
    };

    // Add passive: false to enable preventDefault on touchmove
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pulling, refreshing, pullDistance, isMobile, disabled, onRefresh]);

  // Don't render wrapper on web
  if (!isMobile || disabled) {
    return <>{children}</>;
  }

  const rotation = (pullDistance / maxPullDistance) * 360;
  const opacity = Math.min(pullDistance / refreshThreshold, 1);

  return (
    <div ref={containerRef} className={styles.pullToRefreshContainer}>
      {/* Pull indicator */}
      <div 
        className={styles.pullIndicator}
        style={{
          transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`,
          opacity: opacity,
        }}
      >
        <div 
          className={`${styles.spinnerIcon} ${refreshing ? styles.refreshing : ''}`}
          style={{
            transform: refreshing ? 'rotate(0deg)' : `rotate(${rotation}deg)`,
          }}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: pulling ? `translateY(${pullDistance}px)` : 'translateY(0)',
          transition: pulling ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
