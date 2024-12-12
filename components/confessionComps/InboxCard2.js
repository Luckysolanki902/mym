// components/confessionComps/InboxCard2.js

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import styles from '../componentStyles/inboxStyles.module.css';

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text;
    }
    const truncatedText = text.substring(0, maxLength).trim();
    return `${truncatedText.substr(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(' ')))}...`;
};

const InboxCard2 = ({ entry, userDetails }) => {
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
        // let's make sure it's not empty
        if (event.key === 'Enter' && inputValues[index]?.trim() !== '') {
            handleInputSubmit(index, primaryReplierMid);
        }
    };

    const handleInputBlur = () => {
        setShowInputIndex(-1); // Hide input field on blur
    };

    const handleViewAllReplies = async (primaryReplyId) => {
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

            // Optionally, handle response or update local state if needed

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
            const response = await fetch('/api/confession/updatemainreplyseen', {
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
                const primaryReplyId = entry.target.getAttribute('data-id'); // Assuming data-id corresponds to primaryReplyId

                if (replierMid && primaryReplyId) {
                    setTimeout(() => {
                        handleViewAllReplies(primaryReplyId);
                        updateMainReplySeen(entry.target.getAttribute('data-confession-id'), entry.target.getAttribute('data-confessor-mid'), replierMid);
                    }, 3000);
                }
            }
        });
    }, [handleViewAllReplies, userDetails.mid]);

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

    return (
        <div ref={cardRef} className={`${styles.box} ${entry?.confessorGender === 'female' ? styles.femaleBox : styles.maleBox}`}>
            <div className={styles.confession} id={entry?.confessorGender === 'male' ? styles.maleConfession : styles.femaleConfession}>
                <Link href={disabled ? '' : `/confession/${entry?.confessionId}`} passHref>
                    {truncateText(entry?.confessionContent, 200)}
                </Link>
            </div>
            <div className={styles.youReplied}>You replied to this confession</div>
            <div className={styles.repliesBox}>
                {reversedReplies.filter(reply => reply?.reply !== '').map((reply, index) => {
                    const isUnseen = !reply.seen.includes(userDetails.mid);

                    // Calculate the number of unseen secondary replies
                    const unseenSecondaryRepliesCount = reply.secondaryReplies.filter(
                        secondaryReply => !secondaryReply.seen.includes(userDetails.mid)
                    ).length;

                    return (
                        <div style={{ width: "100%", position: 'relative' }} key={reply._id}>
                            {(isUnseen ||
                                // also render if any of the secondary replies are unseen
                                reply.secondaryReplies.some(secondaryReply => !secondaryReply.seen.includes(userDetails.mid))) &&
                                (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        width: '5px',
                                        height: '5px',
                                        backgroundColor: 'green',
                                        borderRadius: '50%',
                                    }}></div>
                                )}
                            <div className={`reply-observer ${styles.reply}`} data-confession-id={entry?.confessionId} data-confessor-mid={entry?.confessorMid} data-replier-mid={reply?.replierMid} data-id={reply?._id}>
                                <div className={styles.markup} id={reply?.replierGender === 'male' ? styles.maleReply : styles.femaleReply}></div>
                                <div className={styles.replyContent}>{reply?.reply ? reply.reply.charAt(0).toUpperCase() + reply.reply.slice(1) : ''}</div>
                            </div>

                            {/* Reply Button for Primary Replies */}
                            {reply?.secondaryReplies?.length === 0 && (
                                <button className={styles.replyButton} onClick={() => handleReplyButtonClick(index)}>
                                    Reply
                                </button>
                            )}

                            {/* View All Replies Button */}
                            <div className={styles.secRepMainCont}>
                                {reply?.secondaryReplies?.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <button className={styles.replyButton} onClick={() => handleViewAllReplies(index, reply?._id)}>
                                            {showAllRepliesState[index] ? 'Hide all replies' : 'View all replies'}
                                        </button>
                                        {!showAllRepliesState[index] && unseenSecondaryRepliesCount > 0 && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginLeft: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '5px',
                                                    height: '5px',
                                                    backgroundColor: 'green',
                                                    borderRadius: '50%',
                                                }}></div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Secondary Replies */}
                                {showAllRepliesState[index] && reply?.secondaryReplies?.map((secondaryReply, secIndex) => {
                                    const isSecUnseen = !secondaryReply.seen.includes(userDetails.mid);
                                    return (
                                        <div key={secIndex} className={styles.secRep} style={{ position: 'relative' }}>
                                            {isSecUnseen && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '5px',
                                                    right: '5px',
                                                    width: '5px',
                                                    height: '5px',
                                                    backgroundColor: 'green',
                                                    borderRadius: '50%',
                                                }}></div>
                                            )}
                                            <div className={styles.replyContent} style={{ display: 'flex', gap: '0.6rem' }}>
                                                <div>
                                                    {secondaryReply?.sentByConfessor? 'You:' :
                                                        secondaryReply?.sentByConfessor ? 'Her:' : 'Him:'}
                                                </div>
                                                {secondaryReply?.content}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Reply Input Field */}
                                {showInputIndex === index && (
                                    <div className={styles.secRep}>
                                        <div className={styles.markup} id={userDetails.gender === 'male' ? styles.maleReply : styles.femaleReply}></div>
                                        <input
                                            type="text"
                                            value={inputValues[index] || ''}
                                            onChange={(e) => handleInputChange(e, index)}
                                            onKeyDown={(e) => handleInputKeyDown(e, index, reply?.replierMid)}
                                            onBlur={handleInputBlur}
                                            className={styles.replyInput}
                                            placeholder="Type your reply..."
                                            ref={el => inputRefs.current[index] = el} // Assign input ref
                                        />
                                    </div>
                                )}

                                {/* Reply Button for Secondary Replies */}
                                {showInputIndex !== index && reply?.secondaryReplies?.length > 0 && showAllRepliesState[index] && (
                                    <button className={styles.replyButton} onClick={() => handleReplyButtonClick(index)}>
                                        Reply
                                    </button>
                                )}
                                <div ref={lastRefs[index]}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InboxCard2;
