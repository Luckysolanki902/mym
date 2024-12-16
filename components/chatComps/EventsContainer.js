// EventsContainer.js
import React from 'react';
import { useTransition, animated } from 'react-spring';
import Image from 'next/image';
import styles from '../componentStyles/textchat.module.css';
import { useTextChat } from '@/context/TextChatContext';

const EventsContainer = () => {
    const { strangerDisconnectedMessageDiv, strangerIsTyping, hasPaired, strangerGender } = useTextChat();

    // Transition configuration
    const transitionConfig = {
        from: { opacity: 0, height: 0 },
        enter: { opacity: 1, height: 'auto' },
        leave: { opacity: 0, height: 0, duration: 200 }, // Adjust duration for smoother exit
        config: { tension: 120, friction: 18 }
    };

    // Define transitions for stranger typing and goodbye message
    const transitions = useTransition(
        [strangerDisconnectedMessageDiv, strangerIsTyping],
        {
            ...transitionConfig,
            keys: item => item === strangerDisconnectedMessageDiv ? 'goodbye' : 'typing'
        }
    );

    return (
        <>
            {transitions((style, item) =>
                item && (
                    <animated.div style={style}>
                        {item === strangerDisconnectedMessageDiv && !hasPaired && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div className={styles.isTyping}>
                                    {strangerGender === 'male' ? 'He' : 'She'} said “goodbye!!”
                                </div>
                            </div>
                        )}

                        {/* {item === strangerIsTyping && hasPaired && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div className={styles.isTyping}>
                                    {strangerGender === 'male' ? 'He' : 'She'} is typing{' '}
                                   
                                </div>
                            </div>
                        )} */}
                    </animated.div>
                )
            )}
        </>
    );
};

export default EventsContainer;
