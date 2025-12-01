import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles/AudioCallPairingStatus.module.css';
import { useAudioCall, CALL_STATE } from '@/context/AudioCallContext';
import { useFilters } from '@/context/FiltersContext';
import AlgebraEquation from '../commonComps/AlgebraEquation';
import { generateEquationWithContext } from '@/utils/algebraUtils';

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

    const isConnected = callState === CALL_STATE.CONNECTED;
    const isDialing = callState === CALL_STATE.DIALING;

    // Don't show if connected
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

    // Highlight gender words
    const highlightGenderText = (text) => {
        const parts = text.split(/(\bboys\b|\bgirls\b|\banyone\b)/gi);
        return parts.map((part, index) => {
            const lowerPart = part.toLowerCase();
            if (lowerPart === 'boys' || lowerPart === 'girls' || lowerPart === 'anyone') {
                return (
                    <span key={index} className={styles.genderHighlight} style={{ color: theme.primary }}>
                        {part}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    // Get search description
    const getSearchDescription = () => {
        if (isDialing) {
            return `Connecting with ${partner?.nickname || 'your match'}...`;
        }

        const genderText = preferredGender === 'any' ? 'anyone' : (preferredGender === 'male' ? 'boys' : 'girls');
        const collegeText = preferredCollege === 'any' ? 'any college' : 'your college';
        
        if (filterLevel === 1) {
            return `Finding ${genderText} from ${collegeText}`;
        } else if (filterLevel === 2) {
            return `Now finding ${genderText} from any college`;
        } else if (filterLevel === 3) {
            return `Finding anyone available`;
        } else {
            return `Keep waiting, we'll pair you soon`;
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
                <div className={styles.contentWrapper}>
                    {/* Queue Position and Total People */}
                    {!isDialing && (
                        <div className={styles.statsRow}>
                            <div className={styles.statCard}>
                                <span className={styles.statValue} style={{ color: theme.primary }}>
                                    #{queuePosition}
                                </span>
                                <span className={styles.statLabel}>in queue</span>
                            </div>
                            {queueSize > 0 && (
                                <>
                                    <span className={styles.statLabel}>•</span>
                                    <div className={styles.statCard}>
                                        <span className={styles.statValue} style={{ color: theme.primary }}>
                                            {queueSize}
                                        </span>
                                        <span className={styles.statLabel}>{queueSize === 1 ? 'person' : 'people'} waiting</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Search Description */}
                    <div className={styles.searchDescription}>
                        <div className={styles.searchText}>
                            {highlightGenderText(getSearchDescription())}
                        </div>
                        {onlineCount > 0 && !isDialing && (() => {
                            const eq = generateEquationWithContext(onlineCount, 'people online');
                            const userTheme = userGender === 'female' ? 'pink' : userGender === 'male' ? 'cyan' : 'purple';
                            const oppositeTheme = userGender === 'female' ? 'cyan' : userGender === 'male' ? 'pink' : 'purple';
                            return (
                                <AlgebraEquation 
                                    coefficient={eq.coefficient}
                                    constant={eq.constant}
                                    result={eq.result}
                                    hint={eq.hint}
                                    theme={userTheme}
                                    hintTheme={oppositeTheme}
                                    size="medium"
                                />
                            );
                        })()}
                    </div>

                    {/* Status Indicator */}
                    {!isDialing && (
                        <div className={styles.searchingIndicator}>
                            <span className={styles.findingText}>
                                {isDialing ? 'Dialing...' : 'Finding your match'}
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AudioCallPairingStatus;
