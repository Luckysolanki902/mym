// ConfessionFooter.js
import React, { useEffect, useState } from 'react';
import { FaHeart, FaComment } from 'react-icons/fa';
import { IoIosSend } from 'react-icons/io';
import styles from '../componentStyles/confession.module.css';
import AnonymDialog from './AnonymDialog';
import { useMediaQuery } from '@mui/material';

const ConfessionFooter = ({ confession, userDetails, commentsCount, toggleCommentsDialog, handleClick, handleOpenAuthPrompt }) => {
    const [liked, setLiked] = useState(false);
    const isSmallDevice = useMediaQuery('(max-width:800px)');
    const [likeanimation, setlikeanimation] = useState('');
    const [likesCount, setLikesCount] = useState(confession.likes.length);
    const [isAnonymousReplyDialogOpen, setAnonymousReplyDialogOpen] = useState(false);
    const [anonymousReplyValue, setAnonymousReplyValue] = useState('');

    useEffect(() => {
        // Fetch likes for the confession
        const fetchLikes = async () => {
            try {
                const response = await fetch(
                    `/api/getdetails/getlikes?confessionId=${confession._id}`
                );
                if (response.ok) {
                    const { likes } = await response.json();
                    setLiked(
                        likes.some((like) => like.userEmail === userDetails?.email)
                    );
                    setLikesCount(likes.length);
                } else {
                    console.error('Error fetching likes:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching likes:', error);
            }
        };


        fetchLikes();
    }, [confession, userDetails]);

    const handleLike = async () => {
        try {
            // Check if user is authenticated
            if (!userDetails) {
                // Open the authentication prompt
                handleOpenAuthPrompt(true)
                return;
            }

            // Optimistic UI update
            setLiked(!liked);
            if (!liked) {
                setlikeanimation('likeAnim');
                console.log('likeAnim');
            } else {
                setlikeanimation('unlikeAnim');
                console.log('unlikeAnim');
            }
            setLikesCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));

            const likeOperation = {
                email: userDetails?.email,
                confessionId: confession._id,
                liked: !liked,
            };

            // Save like operation locally (for offline support)
            localStorage.setItem(
                'pendingLikeOperation',
                JSON.stringify(likeOperation)
            );

            const response = await fetch(`/api/confession/likeconfession`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(likeOperation),
            });

            if (!response.ok) {
                throw new Error('Error liking/unliking confession');
            }
        } catch (error) {
            console.error('Error liking/unliking confession:', error);
        }
    };
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) {
            return text;
        }
        const truncatedText = text.substring(0, maxLength).trim();
        return `${truncatedText.substr(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(' ')))}...`;
    };


    const handleAnonymousReply = async () => {
        try {
            const { encryptedEmail, iv } = confession;
            const replyData = {
                confessionId: confession._id,
                encryptedEmail,
                confessionContent: truncateText(confession.confessionContent, 100) || 'confession content',
                iv,
                replyContent: { reply: anonymousReplyValue, replierGender: userDetails.gender }, // Modify this line
            };

            const response = await fetch('/api/confession/saveanonymousreply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(replyData),
            });

            if (response.ok) {
                console.log('Anonymous reply sent successfully');
                setAnonymousReplyValue('');
                // You may want to update the UI or trigger a refresh of the replies
            } else {
                console.error('Error saving anonymous reply');
            }
        } catch (error) {
            console.error('Error saving anonymous reply:', error);
        } finally {
            closeAnonymousReplyDialog();
        }
    };

    const closeAnonymousReplyDialog = () => {
        setAnonymousReplyDialogOpen(false);
    };

    return (
        <div>

            <div className={styles.confessionfooter}>
                <div className={styles.likes} onClick={handleLike} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaHeart className={`${styles.iconm} ${liked ? styles.redheart : ''} ${likeanimation ? styles[likeanimation] : ''}`} />
                    </div>
                    <div>{likesCount}</div>
                </div>
                <div className={styles.likes} onClick={toggleCommentsDialog} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaComment style={{ color: 'white' }} className={styles.iconm} />
                    </div>
                    <div>{commentsCount}</div>
                </div>
                <div className={styles.reply} onClick={handleClick}>
                    <input
                        className={styles.anonymInput}
                        type="text"
                        placeholder='Reply anonymously...'
                        value={anonymousReplyValue}
                        onChange={(e) => setAnonymousReplyValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                e.preventDefault();
                                handleAnonymousReply();
                            }
                        }}
                        onClick={() => {
                            if (isSmallDevice && !isAnonymousReplyDialogOpen) {
                                setAnonymousReplyDialogOpen(true)
                            }
                        }}
                    />
                    <button
                        className={styles.comBtn}
                        id={styles.anonsendbtn}
                        variant="text"
                        color="primary"
                        style={{ height: '100%', cursor: 'pointer' }}
                        onClick={handleAnonymousReply}
                        disabled={anonymousReplyValue.trim() === ''}
                    >
                        <IoIosSend style={{ width: '100%', height: 'auto' }} className={styles.iosendanon} />
                    </button>
                </div>
            </div>
            <AnonymDialog
                open={isAnonymousReplyDialogOpen}
                onClose={closeAnonymousReplyDialog}
                handleAnonymousReply={handleAnonymousReply}
                anonymousReplyValue={anonymousReplyValue}
                setAnonymousReplyValue={setAnonymousReplyValue}
            />
        </div>
    );
};

export default ConfessionFooter;
