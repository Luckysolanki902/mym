import React, { useRef, useEffect, useMemo } from 'react';
import { useSpring, animated, useTransition } from 'react-spring';
import Image from 'next/image';
import Message from '@/components/chatComps/Message';
import styles from '../componentStyles/textchat.module.css';
import EventsContainer from './EventsContainer';
import FilterOptions from './FilterOptions';
import { useTextChat } from '@/context/TextChatContext';

const EventsContainerMemoized = React.memo(EventsContainer);

const MessageDisplay = React.memo(({ userDetails }) => {
    const { messages, receiver, strangerGender, hasPaired, strangerDisconnectedMessageDiv, strangerIsTyping, usersOnline, isFindingPair, paddingDivRef } = useTextChat();

    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);
    const shouldRenderPaddingDiv = strangerDisconnectedMessageDiv;

    const prevMessageCountRef = useRef(messages.length);

    // Scroll to the padding div on component mount or when a new message arrives
    useEffect(() => {
        if (paddingDivRef.current) {
            paddingDivRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        prevMessageCountRef.current = messages.length;
    }, [messages]);

    // Animation for padding div
    const paddingDivAnimation = useSpring({
        height: shouldRenderPaddingDiv ? '4rem' : '0rem',
        opacity: 0,
        config: { tension: 220, friction: 20 }
    });

    // Transition for the typing indicator
    const typingTransition = useTransition(strangerIsTyping, {
        from: { transform: 'translateY(50px)', opacity: 0 },
        enter: { transform: 'translateY(0)', opacity: 1 },
        leave: { transform: 'translateY(50px)', opacity: 0 },
        config: { tension: 220, friction: 15, immediate: true }
    });

    // Animation for the messages
    const messageAppearConfig = {
        tension: 180,
        friction: 12,
        from: { translateY: 100, opacity: 0 },
        to: { translateY: 0, opacity: 1 }
    };

    const isNewMessage = messages.length > prevMessageCountRef.current;

    const messageAnimation = useSpring({
        ...messageAppearConfig,
        reset: isNewMessage,
        reverse: !isNewMessage,
    });

    return (
        <div className={`${styles.messCon}`}>
            <EventsContainerMemoized />

            {/* Animated padding div */}
            <animated.div ref={paddingDivRef} className={styles.paddingDiv} style={paddingDivAnimation} />

            {/* Stranger is typing indicator with transition */}
            {typingTransition((style, item) =>
                item && (
                    <animated.div style={style} className={styles.typingContainer}>
                        <Message
                            userDetails={userDetails}
                            isTypingMsg={true}
                            strangerGender={strangerGender}
                        />
                    </animated.div>
                )
            )}

            {reversedMessages?.map((msg, index) => (
                <animated.div key={index} style={index === 0 && isNewMessage ? messageAnimation : {}}>
                    <Message key={index} msg={msg} userDetails={userDetails} receiver={receiver} strangerGender={strangerGender} hasPaired={hasPaired} />
                </animated.div>
            ))}

            {reversedMessages?.length < 1 && hasPaired && (
                <div className={styles.msgIllustration}>
                    <Image src={'/images/illustrations/messages.png'} width={960} height={695} alt="start chat" />
                    <div><span style={{ color: strangerGender === 'female' ? '#FFA0BC' : '#79EAF7' }}>{strangerGender === 'male' ? 'Boy' : 'Girl'}</span> connected</div>
                    <div style={{ fontSize: '0.84rem' }}>Say <span>hi</span> and see where the conversation takes you!</div>
                </div>
            )}

            {!hasPaired && isFindingPair && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'Jost', display: 'flex', alignItems: 'center' }}>
                        <span>Pairing</span>
                        <Image className={styles.dots} priority src={'/gifs/istyping4.gif'} width={800 / 5} height={600 / 5} alt="" />
                    </div>
                </div>
            )}

            <div className={styles.filterPos}>
                <FilterOptions userDetails={userDetails} />
            </div>
        </div>
    );
});

export default MessageDisplay;
