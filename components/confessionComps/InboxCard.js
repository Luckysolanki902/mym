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

const InboxCard = ({ entry, userDetails }) => {
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

                // Update local state optimistically if needed
                // For example:
                // const updatedEntry = { ...entry };
                // updatedEntry.replies[index].secondaryReplies.forEach(reply => {
                //     if (!reply.seen.includes(userDetails.mid)) {
                //         reply.seen.push(userDetails.mid);
                //     }
                // });
                // setEntry(updatedEntry);

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
                    updateMainReplySeen(entry.target.getAttribute('data-confession-id'), entry.target.getAttribute('data-confessor-mid'), replierMid);
                    entry.target.setAttribute('data-seen', 'true');
                }
            }
        });
    }, []);

    useEffect(() => {
        observer.current = new IntersectionObserver(handleObserver, {
            threshold: 0.1,
        }); observer

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



    return (
        <div ref={cardRef} className={`${styles.box} ${entry?.confessorGender === 'female' ? styles.femaleBox : styles.maleBox}`}>
            <div className={styles.confession} id={entry?.confessorGender === 'male' ? styles.maleConfession : styles.femaleConfession}>
                <Link href={disabled ? '' : `/confession/${entry?.confessionId}`}  passHref>
                    {truncateText(entry?.confessionContent, 200)}
                </Link>
            </div>
            {/* <div className={styles.br} style={{ opacity: '0.5' }}></div> */}
            <div className={styles.repliesBox}>
                {reversedReplies.filter(reply => reply?.reply !== '').map((reply, index) => {
                    const isUnseen = !reply.seen.includes(userDetails.mid);

                    const unseenSecondaryRepliesCount = reply.secondaryReplies.filter(
                        secondaryReply => !secondaryReply.seen.includes(userDetails.mid)
                    ).length;

                    return (
                        <div style={{ width: "100%", position: 'relative' }} key={index}>
                            {isUnseen && (
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
                            <div className={`reply-observer ${styles.reply}`} data-confession-id={entry?.confessionId} data-confessor-mid={entry?.confessorMid} data-replier-mid={reply?.replierMid} data-seen={isUnseen ? '' : 'true'}>
                                <div className={styles.markup} id={reply?.replierGender === 'male' ? styles.maleReply : styles.femaleReply}></div>
                                <div className={styles.replyContent}>{reply?.reply ? reply.reply[0].toUpperCase() + reply.reply.slice(1) : ''}</div>
                            </div>

                            {reply?.secondaryReplies?.length === 0 && (
                                <button className={styles.replyButton} onClick={() => handleReplyButtonClick(index)}>
                                    Reply
                                </button>
                            )}

                            {reply?.secondaryReplies?.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <button className={styles.replyButton} onClick={() => handleViewAllReplies(index, reply?._id)}>
                                        {showAllRepliesState[index] ? 'Hide all replies' : 'View all replies'}
                                    </button>
                                    {!showAllRepliesState[index] && unseenSecondaryRepliesCount > 0 && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
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
                            <div className={styles.secRepMainCont}>
                                {showAllRepliesState[index] && reply?.secondaryReplies?.map((secondaryReply, secIndex) => {
                                    const isSecUnseen = !secondaryReply.seen.includes(userDetails?.mid);
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
                                            {/* <div className={styles.markup} id={secondaryReply?.replierGender === 'male' ? styles.maleReply : styles.femaleReply}></div> */}
                                            <div className={styles.replyContent} style={{display:'flex', gap:'0.6rem'}}>
                                                <div>
                                                    {secondaryReply?.sentByConfessor ? 'You:' :
                                                        secondaryReply?.replierGender === 'female' ? 'Her:' : 'Him:'}
                                                </div>
                                                {secondaryReply?.content}</div>
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
                                            ref={el => inputRefs.current[index] = el}
                                        />
                                    </div>
                                )}
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

export default InboxCard;
