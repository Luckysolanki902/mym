
// EventsContainer.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../componentStyles/textchat.module.css';
import { useTextChat } from '@/context/TextChatContext';

const EventsContainer = () => {
    const { strangerDisconnectedMessageDiv, hasPaired, strangerGender } = useTextChat();

    const genderTheme = {
        male: { primary: '#79EAF7', secondary: '#0094d4' },
        female: { primary: '#FFA0BC', secondary: '#e3368d' }
    };
    const theme = genderTheme[strangerGender] || genderTheme.male;

    return (
        <AnimatePresence>
            {strangerDisconnectedMessageDiv && !hasPaired && (
                <motion.div 
                    className={styles.eventContainer}
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                    <div 
                        className={styles.goodbyeMessage}
                        style={{
                            background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.secondary}10 100%)`,
                            borderColor: `${theme.primary}40`, padding: '0.5rem 1rem', borderRadius: '15px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <div className={styles.goodbyeText}>
                            <span style={{ color: theme.secondary }}>
                                {strangerGender === 'male' ? 'He' : 'She'}
                            </span> left 
                        </div>
                        <div className={styles.goodbyeIcon}>✌️</div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EventsContainer;
                          