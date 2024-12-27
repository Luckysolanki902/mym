import React, { useState, useEffect } from 'react';
import styles from './styles/timerbox.module.css';

const TimerBox = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = new Date(targetDate) - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                const padIt = (num) => (num < 10 ? '0' + num : num);

                setTimeLeft({
                    d: padIt(days),
                    h: padIt(hours),
                    m: padIt(minutes),
                    s: padIt(seconds),
                });
            } else {
                setTimeLeft({ d: '00', h: '00', m: '00', s: '00' });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className={styles.timerBox} >
            <div className={styles.timeSection}>
                <div className={styles.time}>{timeLeft.d}</div>
                <div className={styles.label}>Days</div>
            </div>
            <div className={styles.timeSection}>
                <div className={styles.time}>{timeLeft.h}</div>
                <div className={styles.label}>Hours</div>
            </div>
            <div className={styles.timeSection}>
                <div className={styles.time}>{timeLeft.m}</div>
                <div className={styles.label}>Minutes</div>
            </div>
            <div className={styles.timeSection}>
                <div className={styles.time}>{timeLeft.s}</div>
                <div className={styles.label}>Seconds</div>
            </div>
        </div>
    );
};

export default TimerBox;

