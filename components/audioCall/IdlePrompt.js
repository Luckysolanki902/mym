import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles/IdlePrompt.module.css';

const IdlePrompt = ({ userGender, onStartCall }) => {
  const genderTheme = {
    male: { primary: '#79EAF7', secondary: '#0094d4' },
    female: { primary: '#FFA0BC', secondary: '#e3368d' }
  };
  
  const theme = genderTheme[userGender] || genderTheme.male;

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.34, 1.56, 0.64, 1]
      }}
    >
      <div 
        className={styles.promptCard}
        style={{
          background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}12 100%)`,
          borderColor: `${theme.primary}40`,
        }}
      >
        <motion.div 
          className={styles.iconWrapper}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.15,
            duration: 0.4,
            ease: [0.34, 1.56, 0.64, 1]
          }}
        >
          <span className={styles.callIcon}>📞</span>
        </motion.div>
        
        <motion.h3 
          className={styles.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          Ready to Connect
        </motion.h3>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          Start a voice call with a random student
        </motion.p>
        
        <motion.button
          type="button"
          className={styles.startButton}
          onClick={onStartCall}
          style={{
            background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%)`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          whileHover={{ scale: 1.03, boxShadow: `0 8px 24px ${theme.secondary}40` }}
          whileTap={{ scale: 0.97 }}
        >
          Start Call
        </motion.button>
      </div>
    </motion.div>
  );
};

export default IdlePrompt;
