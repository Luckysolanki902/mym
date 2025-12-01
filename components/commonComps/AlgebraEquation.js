import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles/AlgebraEquation.module.css';

/**
 * Beautiful algebraic equation display component
 * Shows equations like: 13x + 19 = 28 where x = people online
 */
const AlgebraEquation = ({ coefficient, constant, result, hint = "x people online", theme = "cyan", hintTheme = null, size = "medium" }) => {
    const hintThemeClass = hintTheme ? styles[hintTheme] : styles[theme];
    
    return (
        <motion.div 
            className={`${styles.equationContainer} ${styles[theme]} ${styles[size]}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <div className={styles.equationWrapper}>
                <div className={styles.equation}>
                    <span className={styles.term}>
                        <span className={styles.coefficient}>{coefficient}</span>
                        <span className={styles.variable}>x</span>
                    </span>
                    <span className={styles.operator}>+</span>
                    <span className={styles.constant}>{constant}</span>
                    <span className={styles.equals}>=</span>
                    <span className={styles.result}>{result}</span>
                </div>
                {hint && (
                    <div className={`${styles.hint} ${hintThemeClass}Hint`}>{hint}</div>
                )}
            </div>
        </motion.div>
    );
};

export default AlgebraEquation;
