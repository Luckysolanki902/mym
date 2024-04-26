import React, { useRef, useEffect, useMemo } from 'react';
import { FaTimes } from 'react-icons/fa';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { IoIosSend } from 'react-icons/io';
import Avatar from 'avataaars';
import styles from '../componentStyles/confession.module.css';
import { useMediaQuery } from '@mui/material';

const CommentsDrawer = ({
  isOpen,
  onClose,
  comments,
  commentValue,
  handleCommentSubmit,
  setCommentValue,
}) => {
  const bottomRef = useRef(null);
  const isSmallScreen = useMediaQuery('(max-width:800px)');
  const drawerContainerRef = useRef(null);
  // const reversedComments = useMemo(() => [...comments].reverse(), [comments]);

  useEffect(() => {
    // Scroll to the bottom when the comments change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [comments, isOpen]);

  // const handleFocus = () => {
  //   if (isSmallScreen && drawerContainerRef.current) {
  //     drawerContainerRef.current.classList.add(styles.fullHeight);
  //   }
  // };

  // const handleBlur = () => {
  //   if (isSmallScreen && drawerContainerRef.current) {
  //     drawerContainerRef.current.classList.remove(styles.fullHeight);
  //   }
  // };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpen}
      onClose={onClose}
      onOpen={() => { }}
    >
      <div className={styles.drawerMainContainer}>
        <div className={styles.drawerHeader}>

          <div className={styles.reply2}>
            <div className={styles.puller}></div>
            <div>

              <input
                type='text'
                placeholder='Add a comment...'
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                style={{ flex: '1', height: '100%', outline: 'none', border: 'none' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim() !== '') {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                autoFocus
              // onFocus={handleFocus}
              // onBlur={handleBlur}
              />
              {/* <button
                className={styles.comBtn}
                variant="contained"
                color="primary"
                onClick={handleCommentSubmit}
                disabled={commentValue.trim() === ''}
                style={{ height: '100%', cursor: 'pointer' }}
              >
                <IoIosSend style={{ width: '100%', height: 'auto' }} />
              </button> */}
            </div>
          </div>
        </div>
        <div
          className={`${styles.drawerContainer} ${isSmallScreen ? styles.smallScreen : ''}`}

        >
          <div ref={drawerContainerRef}></div>
          <div className={styles.comments} style={{ flex: '1', overflowY: 'auto', marginBottom: '1rem' }}>
            <div className={styles.comments}>
              <div ref={bottomRef}></div>
              {comments.map((comment, index) => (
                <div key={comment._id} className={styles.comment}>
                  <div className={comment.gender === 'male' ? styles.maleAvatar : styles.femaleAvatar}>
                    {comment.gender === 'male' ? 'Some Boy:' : 'Some Girl:'}
                  </div>
                  <div className={styles.commentContent}>
                    {comment.commentContent}
                  </div>
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
