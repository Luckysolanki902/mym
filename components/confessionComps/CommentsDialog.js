import React, { useRef, useEffect, useState, useCallback } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { Button, useMediaQuery } from '@mui/material';
import { Close } from '@mui/icons-material';
import styles from '../componentStyles/confession.module.css';
import { FaHeart } from 'react-icons/fa';
import Image from 'next/image';

const CommentsDrawer = ({
  isOpen,
  onClose,
  comments,
  commentValue,
  handleCommentSubmit,
  setCommentValue,
  replyToComment,
  likecomment,
  likereply,
}) => {
  const bottomRef = useRef(null);
  const inputRef = useRef(null); // Reference to the input element
  const isSmallScreen = useMediaQuery('(max-width:800px)');
  const drawerContainerRef = useRef(null);

  const [replyingState, setReplyingState] = useState({
    replying: false,
    replyingToId: '',
    replyingToContent: '',
  });

  // Ref to track if the drawer is open
  const isDrawerOpenRef = useRef(isOpen);

  // Function to handle closing the drawer
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    isDrawerOpenRef.current = isOpen;

    if (isOpen) {
      // Push a new history state when the drawer opens
      window.history.pushState({ drawer: true }, '');

      // Define the popstate handler
      const handlePopState = (event) => {
        if (isDrawerOpenRef.current) {
          // If the drawer is open, close it and prevent default back navigation
          handleClose();
        }
      };

      // Add the popstate event listener
      window.addEventListener('popstate', handlePopState);

      // Cleanup function to remove the event listener when the drawer closes
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, handleClose]);

  useEffect(() => {
    // Scroll to the bottom when the comments change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    // Focus the input when the drawer is open or when replyingState.replying changes
    if ((isOpen || replyingState.replying) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [comments, isOpen, replyingState.replying]);

  const handleReplyClick = (id, content) => {
    setReplyingState({
      replying: true,
      replyingToId: id,
      replyingToContent: content,
    });
  };

  const handleReplySubmit = async () => {
    try {
      if (commentValue.trim() === '') return;

      await replyToComment(replyingState.replyingToId, commentValue);
      setCommentValue('');
      setReplyingState({
        replying: false,
        replyingToId: '',
        replyingToContent: '',
      });
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleLikeClickOnComment = (id) => {
    likecomment(id);
  };

  const handleLikeClickOnReply = (commentId, replyId) => {
    likereply(commentId, replyId);
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpen}
      onClose={handleClose}
      onOpen={() => { }} // Empty function for onOpen
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
      // Customize PaperProps to add top corner radius
      PaperProps={{
        style: {
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        },
        className: styles.customPaper, // Optional: Use a CSS class for more styling
      }}
    >
      <div className={styles.drawerMainContainer}>
        <div className={styles.drawerHeader}>
          <div className={styles.reply2}>
            <div className={styles.puller}></div>
            {replyingState.replying && (
              <div>
                Replying to: {replyingState.replyingToContent}{' '}
                <span
                  onClick={() =>
                    setReplyingState({
                      replying: false,
                      replyingToId: '',
                      replyingToContent: '',
                    })
                  }
                  style={{ cursor: 'pointer', color: 'red' }}
                >
                  <Close />
                </span>
              </div>
            )}
            <div>
              <textarea
                rows={1}

                ref={inputRef}
                type="text"
                placeholder="Add a comment..."
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                style={{
                  flex: '1',
                  height: '100%',
                  outline: 'none',
                  border: 'none',
                  padding: '0.5rem',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim() !== '') {
                    e.preventDefault();
                    replyingState.replying
                      ? handleReplySubmit()
                      : handleCommentSubmit();
                  }
                }}
                autoFocus
                autoComplete="off"
                spellCheck="false"
                autoCorrect="off"
              />
              <Image
                src={'/images/othericons/sendFill.png'}
                width={108}
                height={72}
                alt="icon"
                className={styles.sendIconPhone}
                onClick={(e) => {
                  if (commentValue.trim() !== '') {
                    e.preventDefault();
                    replyingState.replying
                      ? handleReplySubmit()
                      : handleCommentSubmit();
                  }
                }}
              />

            </div>
          </div>
        </div>
        <div
          className={`${styles.drawerContainer} ${isSmallScreen ? styles.smallScreen : ''
            }`}
        >
          <div ref={drawerContainerRef}></div>
          <div
            className={styles.comments}
            style={{ flex: '1', overflowY: 'auto', marginBottom: '1rem' }}
          >
            <div className={styles.comments}>
              <div ref={bottomRef}></div>
              {comments.map((comment) => (
                <div
                  key={comment._id} // Removed Math.random() for stable keys
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <div className={styles.comment}>
                    <div className={styles.commentContent}>
                      <span
                        className={
                          comment.gender === 'male'
                            ? styles.maleAvatar
                            : styles.femaleAvatar
                        }
                      >
                        {comment.gender === 'male' ? 'Some Boy:' : 'Some Girl:'}
                      </span>
                      {comment.commentContent}
                    </div>

                    {/* Uncomment and style these sections as needed
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <Button
                        onClick={() =>
                          handleLikeClickOnComment(comment._id)
                        }
                        style={{ textTransform: 'none' }}
                      >
                        <FaHeart />
                        <span>{comment?.likes?.length}</span>
                      </Button>
                      <Button
                        onClick={() =>
                          handleReplyClick(comment._id, comment.commentContent)
                        }
                        style={{ textTransform: 'none' }}
                      >
                        Reply
                      </Button>
                    </div>
                    */}
                  </div>

                  {/* Uncomment and style replies as needed
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      marginLeft: '2rem',
                    }}
                  >
                    {comment?.replies?.map((reply) => (
                      <div
                        key={reply._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          {reply.gender === 'male'
                            ? 'Some Boy:'
                            : 'Some Girl:'}
                        </div>
                        <div>{reply.replyContent}</div>
                        <Button
                          onClick={() =>
                            handleLikeClickOnReply(comment._id, reply._id)
                          }
                          style={{ textTransform: 'none' }}
                        >
                          <FaHeart />
                          <span>{reply.likes.length}</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                  */}
                </div>
              ))}
              {comments.length < 1 && <>No comments Yet</>}
            </div>
          </div>
        </div>
      </div>
    </SwipeableDrawer>
  );
};

export default CommentsDrawer;
