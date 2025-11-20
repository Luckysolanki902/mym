import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles/MicPermissionPrompt.module.css';
import MicIcon from '@mui/icons-material/Mic';

const MicPermissionPrompt = ({ onEnableMicrophone, userGender }) => {
    const genderTheme = {
        male: {
            primary: '#79EAF7',
            secondary: '#0094d4',
        },
        female: {
            primary: '#FFA0BC',
            secondary: '#e3368d',
        }
    };

    const theme = genderTheme[userGender] || genderTheme.male;

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <motion.button
                className={styles.enableButton}
                onClick={onEnableMicrophone}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                }}
            >
                <MicIcon className={styles.micIcon} />
                <span className={styles.buttonText}>Enable microphone</span>
            </motion.button>
            <p className={styles.helperText}>Tap to start finding</p>
        </motion.div>
    );
};

export default MicPermissionPrompt;
