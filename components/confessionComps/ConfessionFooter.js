// components/ConfessionFooter.js
import React, { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import styles from '../componentStyles/confession.module.css';
import AnonymDialog from './AnonymDialog';
import { Button, useMediaQuery } from '@mui/material';
import Image from 'next/image';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReplyIcon from '@mui/icons-material/Reply';
import { CircularProgress } from '@mui/material';

const ConfessionFooter = ({ confession, userDetails, commentsCount, toggleCommentsDialog, handleClick, handleOpenAuthPrompt, isAdmin, ondeleteClick, handleShareClick }) => {
    const [liked, setLiked] = useState(false);
    const isSmallDevice = useMediaQuery('(max-width:800px)');
    const [likeanimation, setlikeanimation] = useState('');
    const [likesCount, setLikesCount] = useState(confession?.likes?.length);
    const [isAnonymousReplyDialogOpen, setAnonymousReplyDialogOpen] = useState(false);
    const [anonymousReplyValue, setAnonymousReplyValue] = useState('');
    const [sendingAnonymousReply, setSendingAnonymousReply] = useState(false);

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
                        likes.some((like) => like.mid === userDetails?.mid)
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
                handleOpenAuthPrompt(true);
                return;
            }

            // Optimistic UI update
            setLiked(!liked);
            if (!liked) {
                setlikeanimation('likeAnim');
            } else {
                setlikeanimation('unlikeAnim');
            }
            setLikesCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));

            const likeOperation = {
                mid: userDetails?.mid,
                confessionId: confession._id,
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
            // Revert optimistic UI update if error occurs
            setLiked(liked);
            setLikesCount((prevCount) => (liked ? prevCount + 1 : prevCount - 1));
            setlikeanimation('');
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
        if (!userDetails) {
            handleOpenAuthPrompt(true);
            return;
        }
        setSendingAnonymousReply(true);
        try {
            const { encryptedMid, iv } = confession;
            const replyData = {
                confessionId: confession._id,
                encryptedConfessorMid:encryptedMid,
                confessorGender: confession.gender,
                confessionContent: truncateText(confession.confessionContent, 500) || 'confession content',
                iv,
                replyContent: {
                    reply: anonymousReplyValue,
                    replierMid: userDetails?.mid,
                    replierGender: userDetails?.gender,
                },
                userMid: userDetails?.mid,
            };

            const response = await fetch('/api/confession/saveanonymousreply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(replyData),
            });

            if (response.ok) {
                setAnonymousReplyValue('');
            } else {
                const errorData = await response.json();
                console.error('Error saving anonymous reply:', errorData.error);
            }
        } catch (error) {
            console.error('Error saving anonymous reply:', error);
        } finally {
            closeAnonymousReplyDialog();
            setSendingAnonymousReply(false);
        }
    };

    const closeAnonymousReplyDialog = () => {
        setAnonymousReplyDialogOpen(false);
    };

    return (
        <div>
            <div className={styles.confessionfooter}>
                <div className={styles.confessionFooterChild}>
                    <div className={styles.likes} onClick={handleLike} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {liked ? (
                                <FaHeart className={`${styles.iconm} ${styles.redheart} ${likeanimation ? styles[likeanimation] : ''}`} />
                            ) : (
                                <Image src={'/images/othericons/heart.png'} width={50} height={50} alt='' className={`${styles.iconm} ${likeanimation ? styles[likeanimation] : ''}`} style={{ color: 'black' }} />
                            )}
                        </div>
                        <div className={styles.count}>{likesCount}</div>
                    </div>
                    <div className={styles.commentsiconinfooter} onClick={toggleCommentsDialog} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Image src={'/images/othericons/comment.png'} width={50} height={50} alt='' style={{ color: 'white' }} className={styles.iconm} />
                        </div>
                        <div className={styles.count}>{commentsCount}</div>
                    </div>

                    <div style={{ display:'flex', justifyContent:'center', alignItems:'center'}}>
                        <Image src={'/images/othericons/send.png'} width={50} height={50} alt='' onClick={handleShareClick}  className={styles.shareIcon} />
                    </div>
                </div>

                {!isAdmin && <div className={styles.reply} onClick={handleClick}>
                    <div onClick={() => setAnonymousReplyDialogOpen(!isAnonymousReplyDialogOpen)} className={styles.replybutton}><span>|</span>Reply anonymously...</div>
                </div>}
                {/* Delete Button for Admins */}
                {isAdmin && (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={ondeleteClick}
                    >
                        Delete
                    </Button>
                )}
            </div>
            <AnonymDialog
                open={isAnonymousReplyDialogOpen}
                onClose={closeAnonymousReplyDialog}
                handleAnonymousReply={handleAnonymousReply}
                anonymousReplyValue={anonymousReplyValue}
                setAnonymousReplyValue={setAnonymousReplyValue}
                isLoading={sendingAnonymousReply} // Pass loading state to dialog
                userGender={userDetails?.gender}
            />
        </div>
    );
};

export default ConfessionFooter;
