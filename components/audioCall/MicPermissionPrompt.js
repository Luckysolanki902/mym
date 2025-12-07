import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './styles/MicPermissionPrompt.module.css';
import MicIcon from '@mui/icons-material/Mic';
import CallRoundedIcon from '@mui/icons-material/CallRounded';

const MicPermissionPrompt = ({ onEnableMicrophone, userGender }) => {
    const [permissionState, setPermissionState] = useState('unknown'); // 'unknown', 'prompt', 'granted', 'denied'

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

    // Check permission status on mount
    useEffect(() => {
        if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
            // Can't check permission - state stays as 'unknown'
            return;
        }

        let cancelled = false;
        let statusRef = null;

        navigator.permissions
            .query({ name: 'microphone' })
            .then((status) => {
                if (cancelled) return;
                statusRef = status;
                setPermissionState(status.state);
                
                // Listen for changes
                status.onchange = () => {
                    if (!cancelled) {
                        setPermissionState(status.state);
                    }
                };
            })
            .catch(() => {
                // Permissions API not available - state stays as 'unknown'
            });

        return () => {
            cancelled = true;
            if (statusRef) {
                statusRef.onchange = null;
            }
        };
    }, []);

    // Determine button text and icon based on permission state
    const isPermissionGranted = permissionState === 'granted';
    const buttonText = isPermissionGranted ? 'Start Call' : 'Enable microphone';
    const helperText = isPermissionGranted ? 'Tap to find someone' : 'Tap to start finding';
    const ButtonIcon = isPermissionGranted ? CallRoundedIcon : MicIcon;

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
                <ButtonIcon className={styles.micIcon} />
                <span className={styles.buttonText}>{buttonText}</span>
            </motion.button>
            <p className={styles.helperText}>{helperText}</p>
        </motion.div>
    );
};

export default MicPermissionPrompt;
