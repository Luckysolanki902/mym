import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles/PairingStatusDisplay.module.css';
import { useTextChat } from '@/context/TextChatContext';
import { useFilters } from '@/context/FiltersContext';
import AlgebraEquation from '../commonComps/AlgebraEquation';
import { useTextChatOnlineStats } from '@/hooks/useOnlineStats';

const PairingStatusDisplay = ({ userGender, onlineCount = 0 }) => {
    const {
        isFindingPair,
        queuePosition,
        waitTime,
        filterLevel,
        queueSize,
        hasPaired
    } = useTextChat();

    const { preferredGender, preferredCollege } = useFilters();
    
    // Use Redux-managed equation (consistent across Filter and Main UI)
    const { equation } = useTextChatOnlineStats(onlineCount);

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

    // Get search description based on current filter level
    const getSearchDescription = () => {
        const genderText = preferredGender === 'any' ? 'anyone' : (preferredGender === 'male' ? 'boys' : 'girls');
        const collegeText = preferredCollege === 'any' ? 'any college' : 'your college';
        
        if (filterLevel === 1) {
            return `Finding ${genderText} from ${collegeText}`;
        } else if (filterLevel === 2) {
            return `Finding ${genderText} from any college`;
        } else if (filterLevel === 3) {
            return `Finding anyone available`;
        } else if (filterLevel === 4) {
            return `Waiting for more students to join`;
        } else if (filterLevel === 5) {
            return `Try again later, campus is empty`;
        } else {
            return `Finding the next best match`;
        }
    };

    const userTheme = userGender === 'female' ? 'pink' : userGender === 'male' ? 'cyan' : 'purple';
    const oppositeTheme = userGender === 'female' ? 'cyan' : userGender === 'male' ? 'pink' : 'purple';

    // Fallback equation if Redux hasn't initialized yet
    const eq = equation || { coefficient: 11, constant: 1, result: 12, hint: 'n people online' };

    return (
        <AnimatePresence>
            <motion.div
                className={styles.statusContainer}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
            >
                <div className={styles.equationCard}>
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

export default PairingStatusDisplay;
