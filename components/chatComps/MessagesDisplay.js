import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSpring, animated } from 'react-spring';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
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

const MessageDisplay = React.memo(({ userDetails, isStrangerVerified, onlineCount = 0, filterOpenRef }) => {
    const { messages, receiver, strangerGender, hasPaired, strangerDisconnectedMessageDiv, strangerIsTyping, isFindingPair, paddingDivRef, setStrangerIsTyping, socket } = useTextChat();

    const shouldRenderPaddingDiv = strangerDisconnectedMessageDiv;
    
    // Clear typing indicator when stranger disconnects
    useEffect(() => {
        if (strangerDisconnectedMessageDiv && strangerIsTyping) {
            setStrangerIsTyping(false);
        }
    }, [strangerDisconnectedMessageDiv, strangerIsTyping, setStrangerIsTyping]);

    const prevMessageCountRef = useRef(messages.length);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);

    // Robust scroll to bottom function using multiple strategies
    const scrollToEnd = useCallback(() => {
        // Strategy 1: Use container scrollTop with instant scroll for reliability
        if (containerRef.current) {
            const container = containerRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'auto' // Changed from 'smooth' to 'auto' for instant, reliable scroll
            });
        }
        
        // Strategy 2: Also try scrollIntoView as backup
        requestAnimationFrame(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
            }
        });
    }, []);

    // Scroll on new messages
    useEffect(() => {
        if (messages.length > prevMessageCountRef.current || messages.length === 1) {
            // New message arrived - scroll with multiple attempts at different intervals
            scrollToEnd();
            const t1 = setTimeout(scrollToEnd, 50);
            const t2 = setTimeout(scrollToEnd, 150);
            const t3 = setTimeout(scrollToEnd, 300);
            const t4 = setTimeout(scrollToEnd, 500); // Extra timeout for reliability
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
                clearTimeout(t4);
            };
        }
        prevMessageCountRef.current = messages.length;
    }, [messages.length, scrollToEnd]);

    // Scroll when typing indicator appears/disappears
    useEffect(() => {
        if (strangerIsTyping) {
            const t = setTimeout(scrollToEnd, 50);
            return () => clearTimeout(t);
        }
    }, [strangerIsTyping, scrollToEnd]);

    // Animation for padding div
    const paddingDivAnimation = useSpring({
        height: shouldRenderPaddingDiv ? '4rem' : '1rem',
        opacity: 0,
        config: { tension: 220, friction: 20 }
    });

    return (
        <div ref={containerRef} className={`${styles.messCon}`}>
            <EventsContainerMemoized />

            {/* Show connected state ONLY when paired with no messages yet AND stranger hasn't disconnected */}
            {messages?.length < 1 && hasPaired && !strangerDisconnectedMessageDiv && (
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
                        <span 
                            className={styles.verifiedBadge}
                            style={{
                                backgroundColor: isStrangerVerified ? 'transparent' : 'rgba(255, 193, 7, 0.15)',
                                color: isStrangerVerified ? '#5bab5fff' : '#F57C00'
                            }}
                        >
                            {isStrangerVerified ? (
                                <>
                                    <span style={{ marginRight: '0.25rem' }}>✓</span>
                                    <span>verified</span>
                                </>
                            ) : (
                                <>
                                    <span style={{ marginRight: '0.25rem' }}>●</span>
                                    <span>guest</span>
                                </>
                            )}
                        </span>
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

            {/* Show pairing status when actively finding (regardless of previous messages) */}
            {!hasPaired && isFindingPair && !strangerDisconnectedMessageDiv && (
                <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    padding: '2rem 1rem'
                }}>
                    <PairingStatusDisplay userGender={userDetails.gender} onlineCount={onlineCount} />
                </div>
            )}

            {/* Messages in chronological order (oldest first, newest last) */}
            <LayoutGroup>
                <AnimatePresence initial={false} mode="popLayout">
                    {messages?.map((msg, index) => {
                        return (
                            <motion.div 
                                key={msg.id || `msg-${msg.sender}-${index}-${msg.timestamp || index}`}
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ 
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                    opacity: { duration: 0.2 }
                                }}
                                style={{ transformOrigin: 'bottom left', width: '100%', display: 'flow-root' }}
                            >
                                <Message msg={msg} userDetails={userDetails} receiver={receiver} strangerGender={strangerGender} />
                            </motion.div>
                        );
                    })}

                    {/* Typing indicator */}
                    {strangerIsTyping && (
                        <motion.div
                            key="typing-indicator"
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                            transition={{ 
                                type: "spring",
                                stiffness: 500,
                                damping: 30
                            }}
                            style={{ transformOrigin: 'bottom left', width: '100%', display: 'flow-root' }}
                        >
                            <Message
                                userDetails={userDetails}
                                isTypingMsg={true}
                                strangerGender={strangerGender}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </LayoutGroup>

            {/* Animated padding div */}
            <animated.div ref={paddingDivRef} className={styles.paddingDiv} style={paddingDivAnimation} />
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} style={{ height: '1px', width: '100%' }} />

            <div className={styles.filterPos}>
                <FilterOptions 
                    userDetails={userDetails}
                    socket={socket}
                    isFindingPair={isFindingPair}
                    hasPaired={hasPaired}
                    filterOpenRef={filterOpenRef}
                    onlineCount={onlineCount}
                    pageType="textchat"
                />
            </div>
        </div>
    );
});

MessageDisplay.displayName = 'MessageDisplay';

export default MessageDisplay;
