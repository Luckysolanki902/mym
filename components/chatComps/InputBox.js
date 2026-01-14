// components/InputBox.jsx

import React, { useEffect, useRef } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Image from 'next/image';
import { IoIosSend } from 'react-icons/io';
import styles from '../componentStyles/textchat.module.css';
import { useMediaQuery } from '@mui/material';
import { useTextChat } from '@/context/TextChatContext';

const InputBox = ({
    handleFindNewButton,
    handleSendButton,
    textValue,
    setTextValue,
    inpFocus,
    setInpFocus,
    handleKeyDown,
    handleStoppedTyping, // Receive the handler correctly
    typingTimeoutRef,
    inputRef,
    userDetails,
}) => {
    const { isFindingPair, socket, hasPaired, paddingDivRef } = useTextChat();
    const isSmallScreen = useMediaQuery('(max-width:800px)');
    const messagesContainerRef = useRef(null);
    const textAreaRef = useRef(null);

    // Get gender theme colors
    const genderTheme = {
        male: { primary: '#79EAF7', secondary: '#0094d4', border: 'rgba(121, 234, 247, 0.3)' },
        female: { primary: '#FFA0BC', secondary: '#e3368d', border: 'rgba(255, 160, 188, 0.3)' }
    };
    const theme = genderTheme[userDetails?.gender] || genderTheme.male;

    // Scroll to the bottom when inpFocus or textValue changes
    useEffect(() => {
        if (inpFocus && messagesContainerRef.current) {
            messagesContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [inpFocus, textValue]);

    return (
        <div className={styles.inputContainerMainDiv} ref={inputRef}>
            <div 
                className={`${styles.inputContainer} ${inpFocus ? styles.inpFocus : ''}`}
                style={{
                    transition: 'all 0.3s ease'
                }}
            >
                <Tooltip 
                    title={!socket?.connected ? 'Connecting...' : (isFindingPair && !hasPaired) ? 'Finding pair...' : 'Find New'} 
                    placement="top" 
                    arrow
                >
                    <button
                        disabled={!socket?.connected || (isFindingPair && !hasPaired)}
                        className={styles.newButton}
                        onClick={handleFindNewButton}
                        data-tour="find-new-button"
                        style={{
                            opacity: (!socket?.connected || (isFindingPair && !hasPaired)) ? 0.5 : 1,
                            cursor: (!socket?.connected || (isFindingPair && !hasPaired)) ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.3s ease'
                        }}
                    >
                        <Image
                            src={'/images/sidebaricons/randomchat.png'}
                            width={108}
                            height={72}
                            alt="icon"
                            className={styles.randomIcon}
                            style={(isFindingPair && !hasPaired) ? { 
                                transform: 'scale(0.96)',
                                filter: 'grayscale(0.3)',
                                transition: 'all 0.3s ease'
                            } : { transition: 'all 0.3s ease' }}
                        />
                    </button>
                </Tooltip>
                <div className={styles.textBox}>
                    <form 
                        autoComplete="on"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (hasPaired) {
                                handleSendButton();
                                // Keep keyboard open after sending
                                requestAnimationFrame(() => {
                                    textAreaRef.current?.focus();
                                });
                            }
                        }}
                        noValidate
                    >
                        <textarea
                            className={`${styles.textBox} ${styles.input}`}
                            name="message"
                            spellCheck={true}
                            autoCorrect="on"
                            autoCapitalize="sentences"
                            enterKeyHint="send"
                            placeholder={socket?.connected ? ((isFindingPair && !hasPaired) ? "Finding..." : (hasPaired ? "Type your message..." : "Find a pair...")) : "Connecting..."}
                            autoFocus
                            id="messageBox"
                            ref={textAreaRef}
                            value={textValue}
                            onFocus={() => {
                                setInpFocus(true);
                                // Scroll input into view when focused
                                setTimeout(() => {
                                    textAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 300);
                            }}
                            autoComplete="on"
                            rows={1}
                            disabled={!socket?.connected}
                            style={{ 
                                width: '100%', 
                                resize: 'none', 
                                overflow: 'hidden',
                                backgroundColor: 'transparent',
                                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '16px',
                                opacity: socket?.connected ? 1 : 0.6,
                                cursor: socket?.connected ? 'text' : 'not-allowed'
                            }}
                            onChange={(e) => setTextValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleStoppedTyping}
                            onClick={() => {
                                if (messagesContainerRef.current) {
                                    messagesContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                                if (paddingDivRef.current) {
                                    paddingDivRef.current.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        />
                    </form>
                </div>
                <div 
                    className={styles.sendIconPhone}
                    onMouseDown={(e) => e.preventDefault()} // Prevent focus loss on click
                    onClick={(e) => {
                        if(hasPaired){
                            e.preventDefault();
                            handleSendButton();
                            // Keep keyboard open after tapping send icon
                            requestAnimationFrame(() => {
                                textAreaRef.current?.focus();
                            });
                        }
                    }}
                    style={{
                        opacity: hasPaired ? 1 : 0.4,
                        cursor: hasPaired ? 'pointer' : 'not-allowed',
                        pointerEvents: hasPaired ? 'auto' : 'none'
                    }}
                >
                    <Image 
                        src={'/images/othericons/sendFill.png'} 
                        width={108} 
                        height={72} 
                        alt="icon"
                        style={{ pointerEvents: 'none' }}
                    />
                </div>
            </div>
            {/* This div is used to scroll to the bottom */}
            <div ref={messagesContainerRef} />
        </div>
    );
};

export default InputBox;
