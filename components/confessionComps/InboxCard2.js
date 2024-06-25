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
    const lastRef = useRef(null);
    const [inputValues, setInputValues] = useState([]);
    const [showInputIndex, setShowInputIndex] = useState(-1); // -1 means no input is shown
    const observer = useRef(null);
    // Reverse the entries.replies array
    const reversedReplies = useMemo(() => {
        return entry.replies.slice().reverse();
    }, [entry.replies]);

    // State to track which replies are expanded
    const [showAllRepliesState, setShowAllRepliesState] = useState(reversedReplies.map(() => true));

    const disabled = entry.confessionId === undefined;

    const inputRefs = useRef([]);

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
        if (event.key === 'Enter' && inputValues[index] !== '') {
            
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
    
            // Handle response as needed
        } catch (error) {
            console.error('Error updating all secondary replies seen state:', error);
        }
    };
    

    const handleInputSubmit = async (index, primaryReplierMid) => {
        const { confessionId, confessorMid } = entry;
        const { mid } = userDetails;
        const sentByConfessor = mid === confessorMid;
        const secondaryReplyContent = inputValues[index];

        // Optimistically update state
        const updatedEntry = { ...entry };
        const newSecondaryReply = {
            content: secondaryReplyContent,
            sentBy: mid,
            sentByConfessor,
            replierGender: userDetails?.gender,
            seen: [sentByConfessor ? confessorMid : mid],
        };

        updatedEntry.replies.find(reply => reply.replierMid === primaryReplierMid).secondaryReplies.push(newSecondaryReply);
        // setEntry(updatedEntry);

        const newInputValues = [...inputValues];
        newInputValues[index] = '';
        setInputValues(newInputValues);

        // Scroll to last reply after updating state
        if (lastRef.current) {
            setTimeout(() => {
                lastRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
            }, 50);
        }

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
                    userMid:sentByConfessor ? confessorMid : userDetails?.mid,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save secondary reply');
            }

        } catch (error) {
            console.error('Error saving secondary reply:', error);
            // Rollback optimistic update
            // setEntry(initialEntry);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                setShowInputIndex(-1); // Clicked outside the card, hide input field
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const scrollToLastRef = () => {
            if (lastRef.current) {
                lastRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
            }
        };
        scrollToLastRef();
    }, [showAllRepliesState, entry]);


    const handleObserver = useCallback((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const replierMid = entry.target.getAttribute('data-replier-mid');
                const primaryReplyId = entry.target.getAttribute('data-id'); // Assuming data-id corresponds to primaryReplyId
    
                if (replierMid && primaryReplyId) {
                    setTimeout(() => {
                        
                        handleViewAllReplies(primaryReplyId); // Call handleViewAllReplies with primaryReplyId
                    }, 3000);
                }
            }
        });
    }, [handleViewAllReplies]);
    
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
    }, [handleObserver]);
    

    return (
        <div ref={cardRef} className={`${styles.box}`}>
            <div className={styles.confession} id={entry?.confessorGender === 'male' ? styles.maleConfession : styles.femaleConfession}>
                <Link href={disabled ? '' : `/confession/${entry.confessionId}`} passHref>
                    {truncateText(entry.confessionContent, 200)}
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
                        <div style={{ width: "100%", position: 'relative' }} key={index}>
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
                                <div className={styles.replyContent}>{reply?.reply}</div>
                            </div>

                            {reply.secondaryReplies.length === 0 && (
                                <button className={styles.replyButton} onClick={() => handleReplyButtonClick(index)}>
                                    Reply
                                </button>
                            )}

                            {/* {reply.secondaryReplies.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <button className={styles.replyButton} onClick={() => handleViewAllReplies(index)}>
                                        {showAllRepliesState[index] ? 'Hide all replies' : 'View all replies'}
                                    </button>
                                    {!showAllRepliesState[index] && unseenSecondaryRepliesCount > 0 && (
                                        <div style={{
                                            marginLeft: '5px',
                                            width: '5px',
                                            height: '5px',
                                            backgroundColor: 'green',
                                            borderRadius: '50%',
                                        }}></div>
                                    )}
                                </div>
                            )} */}

                            <div className={styles.secRepMainCont}>
                                {showAllRepliesState[index] && reply.secondaryReplies.map((secondaryReply, secIndex) => {
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
                                            <div className={styles.markup} id={secondaryReply.replierGender === 'male' ? styles.maleReply : styles.femaleReply}></div>
                                            <div className={styles.replyContent}>{secondaryReply.content}</div>
                                        </div>
                                    );
                                })}
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
                                {showInputIndex !== index && reply?.secondaryReplies?.length > 0 && (
                                    <button className={styles.replyButton} onClick={() => handleReplyButtonClick(index)}>
                                        Reply
                                    </button>
                                )}
                                <div id='lastref' ref={lastRef}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InboxCard2;
