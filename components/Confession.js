import React, { useState, useEffect, useRef } from 'react';
import styles from './componentStyles/confession.module.css';
import Image from 'next/image';
import { FaHeart, FaComment, FaTimes } from 'react-icons/fa';
import { IoIosSend } from 'react-icons/io';
import { useMediaQuery } from '@mui/material';
import { useInView } from 'react-intersection-observer';
import Typewriter from 'typewriter-effect';
import AuthPrompt from '@/components/AuthPrompt';
import AnonymDialog from './confessionComps/AnonymDialog';
import { getRandomCommentAvatar } from '@/utils/avtarUtils';
import CommentsDialog from './confessionComps/CommentsDialog';

const Confession = ({ confession, userDetails, applyGenderBasedGrandients }) => {
  const isSmallDevice = useMediaQuery('(max-width:800px)');
  const [delay, setDelay] = useState(40);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(confession.likes.length);
  const [commentAvatars, setCommentAvatars] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentValue, setCommentValue] = useState('');
  const [commentsCount, setCommentsCount] = useState('');
  const [isCommentDialogOpen, setCommentDialogOpen] = useState(false);
  const [isAnonymousReplyDialogOpen, setAnonymousReplyDialogOpen] = useState(false);
  const [anonymousReplyValue, setAnonymousReplyValue] = useState('');
  const [gender, setGender] = useState('');
  const [likeanimation, setlikeanimation] = useState('');
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

  const handleOpenAuthPrompt = () => {
    setIsAuthPromptOpen(true);
  };

  const handleCloseAuthPrompt = () => {
    setIsAuthPromptOpen(false);
  };



  const openAnonymousReplyDialog = () => {
    setAnonymousReplyDialogOpen(true);
  };

  const closeAnonymousReplyDialog = () => {
    setAnonymousReplyDialogOpen(false);
  };

  const toggleCommentsDialog = () => {
    setCommentDialogOpen(!isCommentDialogOpen);
  };

  useEffect(() => {
    if (
      applyGenderBasedGrandients &&
      (confession.gender === 'male' || confession.gender === 'female')
    ) {
      setGender(confession.gender);
    }
  }, [confession, applyGenderBasedGrandients]);

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
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `/api/getdetails/getcomments?confessionId=${confession._id}`
        );

        if (response.ok) {
          const { comments } = await response.json();
          const commentAvatars = comments.map((comment) =>
            getRandomCommentAvatar(comment._id, comment.gender)
          );
          setComments(comments);
          setCommentsCount(comments.length);
          setCommentAvatars(commentAvatars);
        } else {
          console.error('Error fetching comments:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchLikes();
    fetchComments();
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

  const handleCommentSubmit = async () => {
    try {
      // Check if user is authenticated
      if (!userDetails) {
        // Open the authentication prompt
        handleOpenAuthPrompt(true);
        return;
      }

      const { email, gender } = userDetails;

      const dataToSend = {
        email,
        gender,
        confessionId: confession._id,
        commentContent: commentValue,
      };

      // Optimistic UI update
      const optimisticComment = {
        _id: new Date().toISOString(), // Use a temporary ID until the server confirms
        userEmail: email,
        confessionId: confession._id,
        commentContent: commentValue,
      };

      setComments((prevComments) => [...prevComments, optimisticComment]);
      setCommentsCount((prevCount) => prevCount + 1);
      setCommentValue('');

      const commentResponse = await fetch('/api/confession/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (commentResponse.ok) {
        console.log('Comment submitted successfully');
        // The server has confirmed the operation, you can update the comment with the real ID if needed
      } else {
        console.error('Error submitting comment');
        // Revert the optimistic update if there was an error
        setComments((prevComments) =>
          prevComments.filter(
            (comment) => comment._id !== optimisticComment._id
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAnonymousReply = async () => {
    try {
      const { encryptedEmail, iv } = confession;
      const replyData = {
        confessionId: confession._id,
        encryptedEmail,
        iv,
        replyContent: anonymousReplyValue,
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

  const handleClick = () => {
    if (isSmallDevice) {
      openAnonymousReplyDialog();
    }
  };
  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  return (
    <div ref={ref} className={styles.mainDiv}>
      <div className={`${styles.mainContainer} ${gender && applyGenderBasedGrandients ? styles[`${gender}Gradient`] : ''}`} onClick={() => setDelay(0)}>
        <div className={styles.textarea} style={{ whiteSpace: 'pre-line' }}>
          {inView ? (
            // Use Typewriter component instead of the old TypingEffect
            <Typewriter
              options={{
                strings: [confession.confessionContent],
                autoStart: true,
                loop: false,
                delay: delay,
                deleteSpeed: 20, // Speed of deleting characters
                pauseFor: 150000,
              }}
            />
          ) : (
            // Display an empty span to preserve the layout
            <span >{confession.confessionContent}</span>
          )}
        </div>
        <div style={{ textAlign: 'right', margin: '1rem 0' }} className={styles.masks}>
          <Image src={'/images/othericons/masks.png'} width={512} height={512} alt='' />
        </div>
      </div>



      <div className={styles.confessionfooter}>
        <div className={styles.likes} onClick={handleLike} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaHeart className={`${styles.iconm} ${liked ? styles.redheart : ''} ${likeanimation ? styles[likeanimation] : ''}`} />
          </div>
          <div>{likesCount}</div>
        </div>
        <div className={styles.likes} onClick={toggleCommentsDialog} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaComment style={{ color: 'white', }} className={styles.iconm} />
          </div>
          <div>{commentsCount}</div>
        </div>
        <div className={styles.reply} onClick={handleClick}>
          <input className={styles.anonymInput} type="text" placeholder='Reply anonymously...'
            value={anonymousReplyValue}
            onChange={(e) => setAnonymousReplyValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim() !== '') {
                e.preventDefault();
                handleAnonymousReply()
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


      <AuthPrompt open={isAuthPromptOpen} onClose={handleCloseAuthPrompt} />


      <CommentsDialog
        isOpen={isCommentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        comments={comments}
        commentAvatars={commentAvatars}
        commentValue={commentValue}
        handleCommentSubmit={handleCommentSubmit}
        setCommentValue={setCommentValue}
      />

      {/* Anon. dialog________________ */}
      <AnonymDialog
        open={isAnonymousReplyDialogOpen}
        onClose={closeAnonymousReplyDialog}
        handleAnonymousReply={handleAnonymousReply}
      />

    </div>
  );
};

export default Confession;
