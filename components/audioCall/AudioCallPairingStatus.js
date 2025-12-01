import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles/AudioCallPairingStatus.module.css';
import { useAudioCall, CALL_STATE } from '@/context/AudioCallContext';
import { useFilters } from '@/context/FiltersContext';
import AlgebraEquation from '../commonComps/AlgebraEquation';
import { useAudioCallOnlineStats } from '@/hooks/useOnlineStats';

const AudioCallPairingStatus = ({ userGender, onlineCount = 0 }) => {
    const {
        isFindingPair,
        queuePosition,
        queueSize,
        filterLevel,
        callState,
        partner
    } = useAudioCall();

    const { preferredGender, preferredCollege } = useFilters();
    
    // Use Redux-managed equation (consistent across Filter and Main UI)
    const { equation } = useAudioCallOnlineStats(onlineCount);

    const isConnected = callState === CALL_STATE.CONNECTED;
    const isDialing = callState === CALL_STATE.DIALING;

    const userTheme = userGender === 'female' ? 'pink' : userGender === 'male' ? 'cyan' : 'purple';
    const oppositeTheme = userGender === 'female' ? 'cyan' : userGender === 'male' ? 'pink' : 'purple';
    
    // Fallback equation if Redux hasn't initialized yet
    const eq = equation || { coefficient: 11, constant: 1, result: 12, hint: 'n callers online' };

    if (isConnected || (!isFindingPair && !isDialing)) return null;

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

    const highlightGenderText = (text) => {
        if (preferredGender === 'any') return text;

        const genderWord = preferredGender === 'male' ? 'boys' : 'girls';
        const regex = new RegExp(`(${genderWord})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            if (part.toLowerCase() === genderWord) {
                return (
                    <span key={`gender-${index}`} className={styles.genderHighlight} style={{ color: theme.primary }}>
                        {part}
                    </span>
                );
            }
            return <span key={`text-${index}`}>{part}</span>;
        });
    };

    const getSearchDescription = () => {
        if (isDialing) {
            return `Connecting with ${partner?.nickname || 'your match'}...`;
        }

        const genderText = preferredGender === 'any' ? 'anyone' : (preferredGender === 'male' ? 'boys' : 'girls');
        const collegeText = preferredCollege === 'any' ? 'any college' : 'your college';
        
        if (filterLevel === 1) {
            return `Finding ${genderText} from ${collegeText}`;
        } else if (filterLevel === 2) {
            return `Finding ${genderText} from any college`;
        } else if (filterLevel === 3) {
            return `Finding anyone available`;
        } else {
            return `Waiting for more students to join`;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className={styles.statusContainer}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <div className={`${styles.equationCard} ${isDialing ? styles.dialingCard : ''}`}>
                    <AlgebraEquation
                        coefficient={eq.coefficient}
                        constant={eq.constant}
                        result={eq.result}
                        hint={eq.hint}
                        theme={userTheme}
                        hintTheme={oppositeTheme}
                        size="large"
                    />
                </div>

                <div className={styles.searchNarrative}>
                    {highlightGenderText(getSearchDescription())}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AudioCallPairingStatus;
