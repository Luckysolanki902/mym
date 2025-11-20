import React, { useRef, useEffect, useMemo } from 'react';
import { useSpring, animated, useTransition } from 'react-spring';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Message from '@/components/chatComps/Message';
import styles from '../componentStyles/textchat.module.css';
import EventsContainer from './EventsContainer';
import FilterOptions from './FilterOptions';
import PairingStatusDisplay from './PairingStatusDisplay';
import { useTextChat } from '@/context/TextChatContext';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const EventsContainerMemoized = React.memo(EventsContainer);

const MessageDisplay = React.memo(({ userDetails, isStrangerVerified }) => {
    const { messages, receiver, strangerGender, hasPaired, strangerDisconnectedMessageDiv, strangerIsTyping, usersOnline, isFindingPair, paddingDivRef, setStrangerIsTyping, socket } = useTextChat();

    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);
    const shouldRenderPaddingDiv = strangerDisconnectedMessageDiv;

    // Clear typing indicator when stranger disconnects
    useEffect(() => {
        if (strangerDisconnectedMessageDiv && strangerIsTyping) {
            setStrangerIsTyping(false);
        }
    }, [strangerDisconnectedMessageDiv, strangerIsTyping, setStrangerIsTyping]);

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

    // Transition for the typing indicator - perfectly timed for message crossfade
    const typingTransition = useTransition(strangerIsTyping, {
        from: { opacity: 0, transform: 'scale(0.9) translateY(10px)', maxHeight: 0 },
        enter: { opacity: 1, transform: 'scale(1) translateY(0px)', maxHeight: 100 },
        leave: { opacity: 0, transform: 'scale(0.95) translateY(-5px)', maxHeight: 0 },
        config: { tension: 220, friction: 24 }
    });

    // Animation for the messages - coordinated with typing indicator fade
    const messageAppearConfig = {
        tension: 240,
        friction: 22,
        from: { translateY: 15, opacity: 0, scale: 0.96 },
        to: { translateY: 0, opacity: 1, scale: 1 }
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

            {/* Stranger is typing indicator with ultra smooth transition */}
            {typingTransition((style, item) =>
                item && (
                    <animated.div 
                        style={{
                            ...style,
                            overflow: 'hidden',
                            transformOrigin: 'left center'
                        }}
                    >
                        <Message
                            userDetails={userDetails}
                            isTypingMsg={true}
                            strangerGender={strangerGender}
                        />
                    </animated.div>
                )
            )}

            {reversedMessages?.map((msg, index) => (
                <animated.div 
                    key={msg.id || `msg-${msg.sender}-${index}-${msg.timestamp || index}`} 
                    style={index === 0 && isNewMessage ? messageAnimation : {}}
                >
                    <Message msg={msg} userDetails={userDetails} receiver={receiver} strangerGender={strangerGender} hasPaired={hasPaired} />
                </animated.div>
            ))}

            {/* Show connected state ONLY when paired with no messages yet AND stranger hasn't disconnected */}
            {reversedMessages?.length < 1 && hasPaired && !strangerDisconnectedMessageDiv && (
                <motion.div 
                    className={styles.msgIllustration}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        <Image src={'/images/illustrations/messages.png'} width={960} height={695} alt="start chat" />
                    </motion.div>
                    <motion.div 
                        className={styles.connectedBadge}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                    >
                        <span className={styles.connectedLabel}>Connected with</span>
                        <span 
                            className={styles.connectedGender}
                            style={{ color: strangerGender === 'female' ? '#EC407A' : '#4FC3F7' }}
                        >
                            {strangerGender === 'male' ? 'a boy' : 'a girl'}
                        </span>
                        {!isStrangerVerified && (
                            <>
                                <span className={styles.verificationDot}></span>
                                <span className={styles.verificationText}>not verified</span>
                            </>
                        )}
                    </motion.div>
                    <motion.div 
                        className={styles.startMessage}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    >
                        Say hi and start chatting
                    </motion.div>
                </motion.div>
            )}

            {/* Show pairing status ONLY when not paired AND actively finding AND no previous chat exists */}
            {!hasPaired && isFindingPair && !strangerDisconnectedMessageDiv && reversedMessages?.length < 1 && (
                <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    padding: '2rem 1rem'
                }}>
                    <PairingStatusDisplay userGender={userDetails.gender} />
                </div>
            )}

            <div className={styles.filterPos}>
                <FilterOptions 
                    userDetails={userDetails}
                    socket={socket}
                    isFindingPair={isFindingPair}
                    hasPaired={hasPaired}
                />
            </div>
        </div>
    );
});

export default MessageDisplay;
