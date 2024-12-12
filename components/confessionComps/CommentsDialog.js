import React, { useRef, useEffect, useState } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { Button, useMediaQuery } from '@mui/material';
import { Close } from '@mui/icons-material';
import styles from '../componentStyles/confession.module.css';
import { FaHeart } from 'react-icons/fa';

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
      onClose={onClose}
      onOpen={() => {}} // Add an empty function for onOpen
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
    >
      <div className={styles.drawerMainContainer}>
        <div className={styles.drawerHeader}>
          <div className={styles.reply2}>
            <div className={styles.puller}></div>
            {replyingState.replying && (
              <div>
                Replying to: {replyingState.replyingToContent}{' '}
                <span onClick={() => setReplyingState({ replying: false, replyingToId: '', replyingToContent: '' })}>
                  <Close />
                </span>
              </div>
            )}
            <div>
              <input
                ref={inputRef}
                type="text"
              
                placeholder="Add a comment..."
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                style={{ flex: '1', height: '100%', outline: 'none', border: 'none' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim() !== '') {
                    e.preventDefault();
                    replyingState.replying ? handleReplySubmit() : handleCommentSubmit();
                  }
                }}
                autoFocus
                autoComplete="off"
                spellCheck="false"
                autoCorrect="off"
              />
            </div>
          </div>
        </div>
        <div className={`${styles.drawerContainer} ${isSmallScreen ? styles.smallScreen : ''}`}>
          <div ref={drawerContainerRef}></div>
          <div className={styles.comments} style={{ flex: '1', overflowY: 'auto', marginBottom: '1rem' }}>
            <div className={styles.comments}>
              <div ref={bottomRef}></div>
              {comments.map((comment) => (
                <div key={`${comment._id}${Math.random()}`} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className={styles.comment}>
                    <div className={styles.commentContent}>     <span className={comment.gender === 'male' ? styles.maleAvatar : styles.femaleAvatar}>
                      {comment.gender === 'male' ? 'Some Boy:' : 'Some Girl:'}
                    </span>{comment.commentContent}</div>

                    {/* <div style={{ display: 'flex', gap: '1rem' }}>
                      <Button onClick={() => handleLikeClickOnComment(comment._id)} style={{ textTransform: 'none' }}>
                        <FaHeart />
                        <span>{comment?.likes?.length}</span>
                      </Button>
                      <Button onClick={() => handleReplyClick(comment._id, comment.commentContent)} style={{ textTransform: 'none' }}>
                        Reply
                      </Button>
                    </div> */}

                  </div>

                  {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft:'2rem' }}>
                    {comment?.replies?.map((reply) => (
                      <div key={reply._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div>{reply.gender === 'male' ? 'Some Boy:' : 'Some Girl:'}</div>
                        <div>{reply.replyContent}</div>
                        <Button onClick={() => handleLikeClickOnReply(comment._id, reply._id)} style={{ textTransform: 'none' }}>
                          <FaHeart />
                          <span>{reply.likes.length}</span>
                        </Button>
                      </div>
                    ))}
                  </div> */}

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
