import React, { useState, useEffect, useRef } from 'react';
import { Typography, Card, CardContent, Divider } from '@mui/material';
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
    const [replySeen, setReplySeen] = useState(entry.replies.map(reply => reply.seen !== undefined ? reply.seen : true));
    const cardRef = useRef(null);
    const [fetchNow, setFetchNow] = useState(false)

    useEffect(() => {
        if (replySeen.every(seen => seen)) return; // If all replies are seen, no need to observe

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    observer.unobserve(cardRef.current);
                    // Call API to update state to 'seen'
                    setFetchNow(true)

                }
            },
            { threshold: 0.5 } // Adjust the threshold as per your requirement
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        } else {
            console.warn("Card ref is null.");
        }
        
        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, [replySeen]); // Added replySeen as dependency
    
    
            useEffect(() => {
                if (entry._id) {
                    fetch('/api/inbox/updateseenstateofinbox', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id: entry._id }), // Assuming '_id' is the ID field
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to update seen state');
                            }
                        })
                        .catch(error => {
                            console.error('Error updating seen state:', error);
                        });
                }
            }, [fetchNow])

    const disabled = entry.confessionId === undefined;

    return (
        <div ref={cardRef} className={`${styles.box} ${replySeen.some(seen => !seen) ? styles.unseen : ''}`}>
            {/* { replySeen.some(seen => !seen) && <div className={styles.greenDot}></div> } */}
            <div className={styles.confession} id={userDetails.gender === 'male' ? styles.maleConfession : styles.femaleConfession}>
                <Link href={disabled ? '' : `/confession/${entry.confessionId}`} passHref>
                    {truncateText(entry.confessionContent, 100)}
                </Link>
            </div>
            <div className={styles.br} style={{opacity:'0.5'}}></div>  
            <div className={styles.repliesBox}>
                {entry.replies.filter(reply=>reply.reply !== '').map((reply, index) => {
                    return (
                        <div key={index} className={`${styles.reply} ${replySeen[index] ? styles.seenReply : ''}`}>
                            {(!replySeen[index]) && <div className={styles.greenDot}></div>}
                            <div className={styles.markup} id={reply.replierGender === 'male' ? styles.maleReply : styles.femaleReply}></div>
                            <div className={styles.replyContent}>{reply.reply}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default InboxCard;
