// MessageContainer.js
import React, { useRef, useEffect, useMemo } from 'react';
import { useSpring, animated } from 'react-spring';
import Image from 'next/image';
import Message from '@/components/chatComps/Message';
import styles from '../componentStyles/textchat.module.css';
import EventsContainer from './EventsContainer';
import FilterOptions from './FilterOptions';
import { useTextChat } from '@/context/TextChatContext';

const EventsContainerMemoized = React.memo(EventsContainer);

const MessageDisplay = React.memo(({ userDetails }) => {

    const { messages, receiver, strangerGender, hasPaired, strangerDisconnectedMessageDiv, strangerIsTyping,usersOnline } = useTextChat()

    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);
    const shouldRenderPaddingDiv = strangerDisconnectedMessageDiv || (hasPaired && strangerIsTyping);

    // Create a ref for the padding div
    const paddingDivRef = useRef(null);

    // Function to scroll to the padding div when a new message arrives
    const scrollToPaddingDiv = () => {
        if (paddingDivRef.current) {
            paddingDivRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Scroll to the padding div on component mount or when a new message arrives
    useEffect(() => {
        scrollToPaddingDiv();
    }, [messages]);

    // Animation config for the latest message
    const messageAppearConfig = {
        tension: 120,
        friction: 18,
        from: { rotateX: 90, translateX: -30, opacity: 0 },
        to: { rotateX: 0, translateX: 0, opacity: 1 }
    };


    // Animation for the latest message
    const messageAnimation = useSpring({
        ...messageAppearConfig,
        reset: true,
        reverse: shouldRenderPaddingDiv && messages.length > 1, // Only reverse when new message arrives, isTyping is false, and there is more than one message
    });

    return (
        <div className={`${styles.messCon} ${!hasPaired && !strangerIsTyping && styles.nopadb}`}>
            <EventsContainerMemoized />

            {/* Padding div with dynamic height based on conditions */}
            <div ref={paddingDivRef} className={styles.paddingDiv} style={{ height: shouldRenderPaddingDiv ? '3rem' : 0, opacity: '0' }}>
                sdfasdf
            </div>

            {reversedMessages.map((msg, index) => (
                <animated.div key={index} style={index === 0 && !strangerIsTyping ? messageAnimation : {}}>
                    <Message key={index} msg={msg} userDetails={userDetails} receiver={receiver} strangerGender={strangerGender} hasPaired={hasPaired} />
                </animated.div>
            ))}
            {/* {usersOnline && <>Users: {usersOnline}</>} */}
            <div className={styles.filterPos}>
                <FilterOptions
                    userDetails={userDetails}
                />
            </div>
        </div>
    );
});

export default MessageDisplay;
