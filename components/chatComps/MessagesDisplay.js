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
    const { messages, receiver, strangerGender, hasPaired, strangerDisconnectedMessageDiv, strangerIsTyping, usersOnline, isFindingPair, paddingDivRef } = useTextChat();

    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);
    const shouldRenderPaddingDiv = strangerDisconnectedMessageDiv || (hasPaired && strangerIsTyping);

    const prevMessageCountRef = useRef(messages.length);

    // Create a ref for the padding div
    const scrollToPaddingDiv = () => {
        if (paddingDivRef.current) {
            paddingDivRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Scroll to the padding div on component mount or when a new message arrives
    useEffect(() => {
        scrollToPaddingDiv();
        prevMessageCountRef.current = messages.length;
    }, [messages]);

    // Animation config for the latest message
    const messageAppearConfig = {
        tension: 120,
        friction: 18,
        from: { rotateX: 90, translateX: -30, opacity: 0 },
        to: { rotateX: 0, translateX: 0, opacity: 1 }
    };

    // Determine if a new message has arrived
    const isNewMessage = messages.length > prevMessageCountRef.current;

    // Animation for the latest message
    const messageAnimation = useSpring({
        ...messageAppearConfig,
        reset: isNewMessage,
        reverse: !isNewMessage,
    });

    // Animation for padding div
    const paddingDivAnimation = useSpring({
        height: shouldRenderPaddingDiv ? '3rem' : '0rem',
        opacity: 0,
        config: { tension: 220, friction: 20 }
    });

    return (
        <div className={`${styles.messCon}`}>
            <EventsContainerMemoized />

            {/* Animated padding div */}
            <animated.div ref={paddingDivRef} className={styles.paddingDiv} style={paddingDivAnimation}>
                sdfasdf
            </animated.div>

            {reversedMessages?.map((msg, index) => (
                <animated.div key={index} style={index === 0 && isNewMessage ? messageAnimation : {}}>
                    <Message key={index} msg={msg} userDetails={userDetails} receiver={receiver} strangerGender={strangerGender} hasPaired={hasPaired} />
                </animated.div>
            ))}

            {reversedMessages?.length < 1 && hasPaired &&
                <div className={styles.msgIllustration}>
                    <Image src={'/images/illustrations/messages.png'} width={960} height={695} alt='start chat' />
                    <div>Say <span>hi</span> and see where the conversation takes you!</div>
                </div>
            }
            {!hasPaired && isFindingPair &&
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'Courgette' }}><span>Pairing</span>
                        <Image className={styles.dots} priority src={'/gifs/istyping4.gif'} width={800 / 5} height={600 / 5} alt='' />
                    </div>
                </div>
            }

            <div className={styles.filterPos}>
                <FilterOptions userDetails={userDetails} />
            </div>
        </div>
    );
});

export default MessageDisplay;
