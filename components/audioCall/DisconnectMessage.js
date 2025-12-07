import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles/DisconnectMessage.module.css';

const DisconnectMessage = ({ partnerGender, userGender, onFindNew }) => {
  const genderTheme = {
    male: { primary: '#79EAF7', secondary: '#0094d4' },
    female: { primary: '#FFA0BC', secondary: '#e3368d' }
  };
  
  const theme = genderTheme[partnerGender] || genderTheme.male;
  const userTheme = genderTheme[userGender] || genderTheme.male;
  const pronoun = partnerGender === 'male' ? 'He' : 'She';

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: -30, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.85 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.34, 1.56, 0.64, 1],
        opacity: { duration: 0.3 }
      }}
    >
      <div 
        className={styles.messageCard}
        style={{
          background: `linear-gradient(135deg, ${theme.primary}12 0%, ${theme.secondary}15 100%)`,
          borderColor: `${theme.primary}50`,
        }}
      >
        <motion.div 
          className={styles.waveIcon}
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
          transition={{ 
            duration: 1.5,
            ease: "easeInOut"
          }}
        >
          👋
        </motion.div>
        <div className={styles.messageText}>
          <span style={{ color: theme.secondary, fontWeight: 600 }}>
            {pronoun}
          </span>
          {' '}said goodbye
        </div>
      </div>
      
      {/* Find New Button */}
      <motion.button
        type="button"
        className={styles.findNewButton}
        onClick={onFindNew}
        style={{
          background: `linear-gradient(135deg, ${userTheme.secondary} 0%, ${userTheme.primary} 100%)`,
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        whileHover={{ scale: 1.03, boxShadow: `0 8px 24px ${userTheme.secondary}40` }}
        whileTap={{ scale: 0.97 }}
      >
        Find New Partner
      </motion.button>
    </motion.div>
  );
};

export default DisconnectMessage;
