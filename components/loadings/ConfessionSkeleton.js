import React from 'react';
import { motion } from 'framer-motion';
import styles from './ConfessionSkeleton.module.css';

const ConfessionSkeleton = () => {
  return (
    <div className={styles.skeletonWrapper}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={styles.skeletonCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1,
            y: 0,
            background: [
              'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(225, 245, 254, 0.3) 100%)',
              'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 235, 238, 0.3) 100%)',
              'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(225, 245, 254, 0.3) 100%)',
            ]
          }}
          transition={{ 
            opacity: { duration: 0.4, delay: index * 0.1 },
            y: { duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] },
            background: {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.5
            }
          }}
        />
      ))}
    </div>
  );
};

export default ConfessionSkeleton;
