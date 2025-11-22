import React from 'react';
import { motion } from 'framer-motion';
import styles from './SoothingLoader.module.css';

const SoothingLoader = () => {
  return (
    <motion.div 
      className={styles.loaderContainer}
      animate={{
        background: [
          'linear-gradient(180deg, #e0f7fa 0%, #ffffff 100%)',
          'linear-gradient(180deg, #fce4ec 0%, #ffffff 100%)',
          'linear-gradient(180deg, #e0f7fa 0%, #ffffff 100%)',
        ]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <motion.div
        className={styles.loadingText}
        animate={{ 
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        loading...
      </motion.div>
    </motion.div>
  );
};

export default SoothingLoader;
