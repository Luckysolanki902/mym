import React from 'react';
import { motion } from 'framer-motion';
import styles from './SoothingLoader.module.css';

const SoothingLoader = () => {
  return (
    <div className={styles.loaderContainer}>
      <motion.div className={styles.logoWrapper}>
        {/* Animated Spyll Logo */}
        <motion.div
          className={styles.spyllLogo}
          animate={{
            scale: [0.9, 0.95, 0.9],
            opacity: [0.7, 0.8, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          spyll
        </motion.div>
        
        {/* Animated Dots */}
        <div className={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={styles.dot}
              animate={{
                y: ['0%', '-50%', '0%'],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SoothingLoader;
