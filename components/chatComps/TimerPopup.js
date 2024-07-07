// /components/chatComps/TimerPopup.js
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import Image from 'next/image';
import styles from './styles/timerpopup.module.css'

const TimerPopup = ({ open, onClose }) => {
    const [timeLeft, setTimeLeft] = useState({ h: '', m: '', s: '' });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const next10PM = new Date();
            next10PM.setHours(22, 0, 0, 0); // Set to 10 PM today

            if (now > next10PM) {
                next10PM.setDate(next10PM.getDate() + 1); // Move to 10 PM tomorrow if now is past 10 PM
            }

            const difference = next10PM - now;

            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            const padIt = (num) => {
                if (parseInt(num) < 10) {
                    return '0' + num
                }
                else {
                    return num
                }
            }

            setTimeLeft({ h: padIt(hours), m: padIt(minutes), s: padIt(seconds) });
        };

        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <Dialog open={open} onClose={onClose} >
            {/* <DialogTitle>Chat Unavailable</DialogTitle> */}
            <DialogContent >
                <div className={styles.main} >

                    <Image src={'/images/large_pngs/hiuser.png'} width={1080 / 3} height={720 / 3} alt='hi'></Image>
                    <div className={styles.text}>This feature is enabled daily @10pm for an hour </div>
                    <div className={styles.timer}>
                        <div className={styles.timeBox}>
                            <div className={styles.time}>{timeLeft.h}</div>
                            <div className={styles.timeCaption}>Hours</div>
                        </div>

                        <div className={styles.colon}>:</div>

                        <div className={styles.timeBox}>
                            <div className={styles.time}>{timeLeft.m}</div>
                            <div className={styles.timeCaption}>Minutes</div>
                        </div>

                        <div className={styles.colon}>:</div>
                        <div className={styles.timeBox}>
                            <div className={styles.time}>{timeLeft.s}</div>
                            <div className={styles.timeCaption}>Seconds</div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TimerPopup;
