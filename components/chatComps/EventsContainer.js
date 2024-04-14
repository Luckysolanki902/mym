// EventsContainer.js
import React, { useEffect } from 'react';
import Image from 'next/image';
import styles from '../componentStyles/textchat.module.css';

const EventsContainer = ({ strangerDisconnectedMessageDiv, strangerIsTyping, hasPaired, strangerGender }) => {
    console.log(strangerGender)
    useEffect(() => {
        console.log('stranger is typing');
    }, [strangerIsTyping, strangerGender]); // Include strangerGender as a dependency

    return (
        <>
            {strangerDisconnectedMessageDiv && !hasPaired && (
                <div className={styles.isTyping}>He said “good Bye!!”</div>
            )}

            {hasPaired && strangerIsTyping && (
                <div className={`${styles.isTyping}`}>
                    {strangerGender === 'male' ? 'He' : 'She'} is typing{' '}
                    <span>
                        <Image src={'/gifs/istyping4.gif'} width={800 / 2} height={600 / 2} alt='' />
                    </span>{' '}
                </div>
            )}
        </>
    );
};

export default EventsContainer;
