import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles/PairingStatusDisplay.module.css';
import { useTextChat } from '@/context/TextChatContext';
import { useFilters } from '@/context/FiltersContext';

const PairingStatusDisplay = ({ userGender }) => {
    const {
        isFindingPair,
        queuePosition,
        waitTime,
        filterLevel,
        queueSize,
        hasPaired
    } = useTextChat();

    const { preferredGender, preferredCollege } = useFilters();

    if (hasPaired || !isFindingPair) return null;

    const genderTheme = {
        male: {
            primary: '#79EAF7',
            secondary: '#0094d4',
            gradient: 'linear-gradient(135deg, rgba(121, 234, 247, 0.15) 0%, rgba(0, 148, 212, 0.15) 100%)',
            borderColor: 'rgba(121, 234, 247, 0.3)',
            rippleColor: 'rgba(121, 234, 247, 0.4)'
        },
        female: {
            primary: '#FFA0BC',
            secondary: '#e3368d',
            gradient: 'linear-gradient(135deg, rgba(255, 160, 188, 0.15) 0%, rgba(227, 54, 141, 0.15) 100%)',
            borderColor: 'rgba(255, 160, 188, 0.3)',
            rippleColor: 'rgba(255, 160, 188, 0.4)'
        }
    };

    const theme = genderTheme[userGender] || genderTheme.male;

    // Highlight gender words with proper formatting
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

    // Get search description based on current filter level
    const getSearchDescription = () => {
        const genderText = preferredGender === 'any' ? 'anyone' : (preferredGender === 'male' ? 'boys' : 'girls');
        const collegeText = preferredCollege === 'any' ? 'any college' : 'your college';
        
        if (filterLevel === 1) {
            return `Finding ${genderText} from ${collegeText}`;
        } else if (filterLevel === 2) {
            return `Couldn't find exact match • Now finding ${genderText} from any college`;
        } else if (filterLevel === 3) {
            return `Still searching • Now finding anyone available`;
        } else if (filterLevel === 4) {
            return `No users available right now • Keep waiting, we'll pair you soon`;
        } else if (filterLevel === 5) {
            return `Maximum wait time reached • Try again later`;
        } else {
            return `Keep waiting for more users to join`;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className={styles.statusContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className={styles.contentWrapper}>
                    {/* Queue Position and Total People */}
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

                    {/* Search Description */}
                    <div className={styles.searchDescription}>
                        <div className={styles.searchText}>
                            {highlightGenderText(getSearchDescription())}
                        </div>
                    </div>

                    {/* Searching Indicator */}
                    <div className={styles.searchingIndicator}>
                        <span className={styles.findingText}>
                            Finding your match
                        </span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PairingStatusDisplay;
