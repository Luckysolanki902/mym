import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles/AudioWaveform.module.css';

const AudioWaveform = ({ isActive = true, userGender }) => {
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

    // Generate 20 bars for waveform
    const bars = Array.from({ length: 20 });

    return (
        <div className={styles.waveformContainer}>
            <div className={styles.waveform}>
                {bars.map((_, index) => (
                    <motion.div
                        key={index}
                        className={styles.bar}
                        style={{
                            background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                        }}
                        animate={isActive ? {
                            scaleY: [0.3, 1, 0.3],
                        } : {
                            scaleY: 0.3
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: index * 0.05,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default AudioWaveform;
