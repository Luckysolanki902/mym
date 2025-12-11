import React from 'react';
import styles from './ConfessionSkeleton.module.css';

const ConfessionSkeleton = ({ count = 3 }) => {
  return (
    <div className={styles.skeletonWrapper}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={styles.skeletonCard}
          style={{ animationDelay: `${index * 0.15}s` }}
        >
          {/* Content lines */}
          <div className={styles.contentArea}>
            <div className={`${styles.line} ${styles.lineShort}`} style={{ animationDelay: `${index * 0.15 + 0.1}s` }} />
            <div className={`${styles.line} ${styles.lineFull}`} style={{ animationDelay: `${index * 0.15 + 0.2}s` }} />
            <div className={`${styles.line} ${styles.lineFull}`} style={{ animationDelay: `${index * 0.15 + 0.3}s` }} />
            <div className={`${styles.line} ${styles.lineMedium}`} style={{ animationDelay: `${index * 0.15 + 0.4}s` }} />
          </div>
          
          {/* Footer area */}
          <div className={styles.footerArea}>
            <div className={styles.footerLeft}>
              <div className={`${styles.circle} ${styles.small}`} />
              <div className={`${styles.line} ${styles.lineXs}`} />
            </div>
            <div className={styles.footerRight}>
              <div className={`${styles.line} ${styles.lineXs}`} />
            </div>
          </div>
          
          {/* Actions area */}
          <div className={styles.actionsArea}>
            <div className={styles.actionGroup}>
              <div className={`${styles.circle} ${styles.tiny}`} />
              <div className={`${styles.line} ${styles.lineTiny}`} />
            </div>
            <div className={styles.actionGroup}>
              <div className={`${styles.circle} ${styles.tiny}`} />
              <div className={`${styles.line} ${styles.lineTiny}`} />
            </div>
            <div className={`${styles.circle} ${styles.tiny}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConfessionSkeleton;
