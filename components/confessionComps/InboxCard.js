// components/confessionComps/InboxCard.js

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../componentStyles/inboxStyles.module.css';

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text;
    }
    const truncatedText = text.substring(0, maxLength).trim();
    return `${truncatedText.substr(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(' ')))}...`;
};

const InboxCard = ({ entry, userDetails }) => {
    const router = useRouter();
    const cardRef = useRef(null);
    const [inputValues, setInputValues] = useState([]);
    const [showInputIndex, setShowInputIndex] = useState(-1);
    const [showAllRepliesState, setShowAllRepliesState] = useState([]);

    const disabled = entry?.confessionId === undefined;
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

    const justShowThemAll = (index) => {
        const newShowAllRepliesState = [...showAllRepliesState];
        newShowAllRepliesState[index] = true;
        setShowAllRepliesState(newShowAllRepliesState);
    };

    const handleInputKeyDown = (event, index, primaryReplierMid) => {
        if (event.key === 'Enter' && inputValues[index] !== '') {
            justShowThemAll(index);
            handleInputSubmit(index, primaryReplierMid);
        }
    };

    const handleInputBlur = () => {
        setShowInputIndex(-1); // Hide input field on blur
    };

    const handleViewAllReplies = async (index, id) => {
        const newShowAllRepliesState = [...showAllRepliesState];
        newShowAllRepliesState[index] = !newShowAllRepliesState[index];
        setShowAllRepliesState(newShowAllRepliesState);

        if (newShowAllRepliesState[index]) {
            try {
                const response = await fetch('/api/inbox/updatesecondaryrepliesseen', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        confessionId: entry.confessionId,
                        confessorMid: entry.confessorMid,
                        primaryReplyId: id, // Pass the _id of the primary reply
                        userMid: userDetails?.mid,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update all secondary replies seen state');
                }

                // Optionally, handle response or update local state if needed

            } catch (error) {
                console.error('Error updating all secondary replies seen state:', error);
            }
        }
    };

    const handleInputSubmit = async (index, primaryReplierMid) => {
        const { confessionId, confessorMid } = entry;
        const { mid } = userDetails;
        const sentByConfessor = mid === confessorMid;
        const secondaryReplyContent = inputValues[index];

        const updatedEntry = { ...entry };
        const newSecondaryReply = {
            content: secondaryReplyContent,
            sentBy: mid,
            sentByConfessor,
            replierGender: userDetails?.gender,
            seen: [sentByConfessor ? confessorMid : mid],
        };

        updatedEntry?.replies.find(reply => reply.replierMid === primaryReplierMid).secondaryReplies.push(newSecondaryReply);

        const newInputValues = [...inputValues];
        newInputValues[index] = '';
        setInputValues(newInputValues);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
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


    const handleObserver = useCallback((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const replierMid = entry.target.getAttribute('data-replier-mid');
                if (replierMid && !entry.target.getAttribute('data-seen')) {
                    updateMainReplySeen(
                        entry.target.getAttribute('data-confession-id'),
                        entry.target.getAttribute('data-confessor-mid'),
                        replierMid
                    );
                    entry.target.setAttribute('data-seen', 'true');
                }
            }
        });
    }, []);

    useEffect(() => {
        observer.current = new IntersectionObserver(handleObserver, {
            threshold: 0.1,
        });

        const elements = document.querySelectorAll('.reply-observer');
        elements.forEach(element => {
            observer.current.observe(element);
        });

        return () => {
            observer.current.disconnect();
        };
    }, [handleObserver, entry]);

    const reversedReplies = useMemo(() => entry?.replies?.slice().reverse(), [entry?.replies]);

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
        const index = showAllRepliesState.findIndex(state => state === true);
        if (index !== -1) {
            scrollToLastRef(index);
        }
    }, [showAllRepliesState, entry]);

    const scrollToLastRef = (index) => {
        if (index >= 0 && index < showAllRepliesState.length && showAllRepliesState[index]) {
            const lastRef = lastRefs[index];
            if (lastRef && lastRef.current) {
                lastRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }
    };

    const lastRefs = useMemo(() => (
        reversedReplies.map(() => React.createRef())
    ), [reversedReplies]);

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

export default InboxCard;
