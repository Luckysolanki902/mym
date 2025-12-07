import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles/OnlineCounter.module.css';

/**
 * Minimalist online counter display
 * Shows direct count with opposite gender theme for visual appeal
 * Count is always at least 1 to avoid showing 0
 */
const OnlineCounter = ({ count, userGender, label = "online", size = "medium" }) => {
    // Opposite theme: if user is male, show pink (girls), if female show cyan (boys)
    const theme = userGender === 'male' ? 'pink' : userGender === 'female' ? 'cyan' : 'purple';
    
    // Ensure count is always at least 1
    const displayCount = Math.max(1, count || 0);
    
    return (
        <motion.div 
            className={`${styles.counterContainer} ${styles[theme]} ${styles[size]}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <div className={styles.counterWrapper}>
                <div className={styles.pulseRing} />
                <div className={styles.countDisplay}>
                    <span className={styles.count}>{displayCount}</span>
                    <span className={styles.label}>{label}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default OnlineCounter;
