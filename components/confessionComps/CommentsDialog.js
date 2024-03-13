import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { IoIosSend } from 'react-icons/io';
import Avatar from 'avataaars';
import styles from '../componentStyles/confession.module.css';

const CommentsDialog = ({
  isOpen,
  onClose,
  comments,
  commentAvatars,
  commentValue,
  handleCommentSubmit,
  setCommentValue,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Comments
          <FaTimes style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>
      </DialogTitle>
      <DialogContent style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Comment input and display */}
        <div className={styles.comments} style={{ flex: '1', overflowY: 'auto', marginBottom: '1rem' }}>
          <div className={styles.comments}>
            {comments.map((comment, index) => (
              <div key={comment._id} className={styles.comment}>
                <div className={styles.avatar}>
                  <Avatar
                    style={{ width: '30px', height: '30px' }}
                    avatarStyle='Circle'
                    {...commentAvatars[index]}
                  />
                </div>
                <div className={styles.commentContent}>
                  {comment.commentContent}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Comment input */}
        <div className={styles.reply2}>
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
          />
          <button
            className={styles.comBtn}
            variant="contained"
            color="primary"
            onClick={handleCommentSubmit}
            disabled={commentValue.trim() === ''}
            style={{ height: '100%', cursor: 'pointer' }}
          >
            <IoIosSend style={{ width: '100%', height: 'auto' }} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsDialog;
