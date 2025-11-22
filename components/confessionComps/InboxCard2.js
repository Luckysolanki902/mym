// components/confessionComps/InboxCard2.js

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../componentStyles/inboxStyles.module.css';
import Image from 'next/image';

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text;
    }
    const truncatedText = text.substring(0, maxLength).trim();
    return `${truncatedText.substr(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(' ')))}...`;
};

const InboxCard2 = ({ entry, userDetails }) => {
    const router = useRouter();
    const cardRef = useRef(null);
    const [inputValues, setInputValues] = useState([]);
    const [showInputIndex, setShowInputIndex] = useState(-1); // -1 means no input is shown
    const [showAllRepliesState, setShowAllRepliesState] = useState([]);
    const [lastRefs, setLastRefs] = useState([]);

    const disabled = entry.confessionId === undefined;
    const inputRefs = useRef([]);
    const observer = useRef(null);

    const handleInputChange = (event, index) => {
        const newInputValues = [...inputValues];
        newInputValues[index] = event.target.value;
        setInputValues(newInputValues);
    };

    const handleReplyButtonClick = (index) => {
        setShowInputIndex(index === showInputIndex ? -1 : index); // Toggle show/hide
        if (index !== showInputIndex) {
            setTimeout(() => inputRefs.current[index]?.focus(), 0); // Focus the input field after it's shown
        }
    };

    const handleInputKeyDown = (event, index, primaryReplierMid) => {
        // Ensure input is not empty
        if (event.key === 'Enter' && inputValues[index]?.trim() !== '') {
            handleInputSubmit(index, primaryReplierMid);
        }
    };

    const handleInputBlur = () => {
        setShowInputIndex(-1); // Hide input field on blur
    };

    const handleViewAllReplies = async (index, primaryReplyId) => {
        try {
            const response = await fetch('/api/inbox/updatesecondaryrepliesseen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    confessionId: entry.confessionId,
                    confessorMid: entry.confessorMid,
                    primaryReplyId: primaryReplyId,
                    userMid: userDetails?.mid,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update all secondary replies seen state');
            }

            // Toggle show/hide for the specific index
            setShowAllRepliesState(prevState => {
                const newState = [...prevState];
                newState[index] = !newState[index];
                return newState;
            });

        } catch (error) {
            console.error('Error updating all secondary replies seen state:', error);
        }
    };

    const handleInputSubmit = async (index, primaryReplierMid) => {
        const { confessionId, confessorMid } = entry;
        const { mid } = userDetails;
        const sentByConfessor = mid === confessorMid;
        const secondaryReplyContent = inputValues[index]?.trim();

        const updatedEntry = { ...entry };
        const newSecondaryReply = {
            content: secondaryReplyContent,
            sentBy: mid,
            sentByConfessor,
            replierGender: userDetails?.gender,
            seen: [sentByConfessor ? confessorMid : mid],
        };

        const primaryReply = updatedEntry?.replies.find(reply => reply.replierMid === primaryReplierMid);
        if (primaryReply) {
            primaryReply.secondaryReplies.push(newSecondaryReply);
        }

        const newInputValues = [...inputValues];
        newInputValues[index] = '';
        setInputValues(newInputValues);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Now make the actual API call
            const response = await fetch('/api/confession/saveanonymoussecondaryreplies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    confessionId,
                    confessorMid,
                    replierMid: primaryReplierMid,
                    secondaryReplyContent,
                    sentByConfessor,
                    replierGender: userDetails?.gender,
                    userMid: sentByConfessor ? confessorMid : userDetails?.mid,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save secondary reply');
            }

            scrollToLastRef(index);
        } catch (error) {
            console.error('Error saving secondary reply:', error);
        }
    };

    const updateMainReplySeen = async (confessionId, confessorMid, replierMid) => {
        try {
            const response = await fetch('/api/inbox/updatemainreplyseen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    confessionId,
                    confessorMid,
                    replierMid,
                    userMid: userDetails.mid,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update main reply seen state');
            }
        } catch (error) {
            console.error('Error updating main reply seen state:', error);
        }
    };

    const reversedReplies = useMemo(() => entry?.replies?.slice().reverse(), [entry?.replies]);

    const handleObserver = useCallback((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const replierMid = entry.target.getAttribute('data-replier-mid');
                const primaryReplyId = entry.target.getAttribute('data-id'); // Assuming data-id corresponds to primaryReplyId

                if (replierMid && primaryReplyId) {
                    // Find the index of the reply with primaryReplyId
                    const index = reversedReplies.findIndex(reply => reply._id === primaryReplyId);
                    if (index !== -1) {
                        setTimeout(() => {
                            handleViewAllReplies(index, primaryReplyId);
                            updateMainReplySeen(
                                entry.target.getAttribute('data-confession-id'),
                                entry.target.getAttribute('data-confessor-mid'),
                                replierMid
                            );
                        }, 3000);
                    }
                }
            }
        });
    }, [reversedReplies]);


    useEffect(() => {
        observer.current = new IntersectionObserver(handleObserver, {
            threshold: 0.1,
        });

        const elements = document.querySelectorAll('.reply-observer');
        elements.forEach(element => {
            observer.current.observe(element);
        });

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [handleObserver, reversedReplies]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                setShowInputIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const scrollToLastRef = () => {
            if (lastRefs.length > 0) {
                const lastRef = lastRefs[lastRefs.length - 1];
                if (lastRef && lastRef.current) {
                    lastRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
                }
            }
        };
        scrollToLastRef();
    }, [showAllRepliesState, entry, lastRefs]);

    useEffect(() => {
        setLastRefs(reversedReplies.map(() => React.createRef()));
    }, [reversedReplies]);

    const scrollToLastRef = (index) => {
        if (index >= 0 && index < lastRefs.length && showAllRepliesState[index]) {
            const lastRef = lastRefs[index];
            if (lastRef && lastRef.current) {
                lastRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }
    };

    const handleCardClick = () => {
        if (!disabled) {
            router.push(`/inbox/conversation/${entry?.confessionId}`);
        }
    };

    return (
        <div 
            ref={cardRef} 
            className={`${styles.box} ${entry?.confessorGender === 'female' ? styles.femaleBox : styles.maleBox}`}
            onClick={handleCardClick}
        >
            <div className={styles.confession} id={entry?.confessorGender === 'male' ? styles.maleConfession : styles.femaleConfession}>
                {truncateText(entry?.confessionContent, 150)}
            </div>

            <div 
                className={styles.youReplied}
                style={{
                    background: entry?.confessorGender === 'male' 
                        ? 'rgba(131, 231, 253, 0.2)' 
                        : 'rgba(255, 182, 210, 0.2)',
                    color: entry?.confessorGender === 'male' 
                        ? 'rgba(1, 87, 155, 0.85)' 
                        : 'rgba(157, 0, 65, 0.85)'
                }}
            >
                You replied to this
            </div>
            <div style={{ 
                fontSize: '0.85rem', 
                color: entry?.confessorGender === 'male' ? 'rgba(1, 87, 155, 0.6)' : 'rgba(157, 0, 65, 0.6)',
                fontFamily: 'Jost'
            }}>
                {reversedReplies?.length} {reversedReplies?.length === 1 ? 'reply' : 'replies'}
            </div>
        </div>
    );
};

export default InboxCard2;
