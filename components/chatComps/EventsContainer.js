// EventsContainer.js
import React, { useEffect } from 'react';
import Image from 'next/image';
import styles from '../componentStyles/textchat.module.css';
import { useTextChat } from '@/context/TextChatContext';

const EventsContainer = () => {
    const { strangerDisconnectedMessageDiv, strangerIsTyping, hasPaired, strangerGender } = useTextChat()

    // console.log({strangerGender})
    // useEffect(() => {
    //     console.log('stranger is typing');
    // }, [strangerIsTyping, strangerGender]); // Include strangerGender as a dependency

    return (
        <>
            {(strangerDisconnectedMessageDiv && !hasPaired) && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className={styles.isTyping}>He said “good Bye!!”</div>
                </div>
            )}

            {hasPaired && strangerIsTyping && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className={`${styles.isTyping}`}>
                        {strangerGender === 'male' ? 'He' : 'She'} is typing{' '}
                        <span>
                            <Image priority src={'/gifs/istyping4.gif'} width={800 / 5} height={600 / 5} alt='' />
                        </span>{' '}
                    </div>
                </div>

            )}
        </>
    );
};

export default EventsContainer;
