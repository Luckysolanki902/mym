// components/fullPageComps/Confession.js

import React, { useState, useEffect } from 'react';
import styles from '../componentStyles/confession.module.css';
import { IoIosSend } from 'react-icons/io';
import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useMediaQuery
} from '@mui/material';
import { useInView } from 'react-intersection-observer';
import AuthPrompt from '@/components/commonComps/AuthPrompt';
import CommentsDialog from '../confessionComps/CommentsDialog';
import ConfessionBox from '../confessionComps/ConfessionBox';
import ConfessionFooter from '../confessionComps/ConfessionFooter';
import DeleteIcon from '@mui/icons-material/Delete';

const Confession = ({
  confession,
  userDetails,
  applyGenderBasedGrandients,
  isAdmin = false, // Indicates if the user is an admin
  onDelete, // Callback function to handle deletion
}) => {
  const isSmallDevice = useMediaQuery('(max-width:800px)');
  const [isAnonymousReplyDialogOpen, setAnonymousReplyDialogOpen] = useState(false);
  const [commentAvatars, setCommentAvatars] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentValue, setCommentValue] = useState('');
  const [commentsCount, setCommentsCount] = useState('');

  const [isCommentDialogOpen, setCommentDialogOpen] = useState(false);
  const [gender, setGender] = useState('');
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [commentCountsMadeByUser, setCommentCountsMadeByUser] = useState({});
  const [replyCountsMadeByUser, setReplyCountsMadeByUser] = useState({});

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpenAuthPrompt = () => {
    setIsAuthPromptOpen(true);
  };

  const handleCloseAuthPrompt = () => {
    setIsAuthPromptOpen(false);
  };

  const openAnonymousReplyDialog = () => {
    setAnonymousReplyDialogOpen(true);
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
    const savedCommentCountsMadeByUser = localStorage.getItem('commentCountsMadeByUser');
    if (savedCommentCountsMadeByUser) {
      setCommentCountsMadeByUser(JSON.parse(savedCommentCountsMadeByUser));
    }

    const savedReplyCountsMadeByUser = localStorage.getItem('replyCountsMadeByUser');
    if (savedReplyCountsMadeByUser) {
      setReplyCountsMadeByUser(JSON.parse(savedReplyCountsMadeByUser));
    }
  }, []);

  const handleCommentSubmit = async () => {
    try {
      // Check if user is authenticated
      if (!userDetails) {
        // Open the authentication prompt
        handleOpenAuthPrompt(true);
        return;
      }

      if (!commentCountsMadeByUser[confession._id]) {
        commentCountsMadeByUser[confession._id] = 0;
      }

      if (commentCountsMadeByUser[confession._id] >= 2) {
        alert('You can only make 2 comments per post.');
        return;
      }

      const { gender, mid } = userDetails;

      const dataToSend = {
        gender,
        confessionId: confession._id,
        commentContent: commentValue,
        mid: mid,
      };

      // Optimistic UI update
      const optimisticComment = {
        _id: new Date().toISOString(), // Use a temporary ID until the server confirms
        confessionId: confession._id,
        commentContent: commentValue,
        gender: userDetails.gender,
        mid: mid,
      };

      setComments((prevComments) => [optimisticComment, ...prevComments]);
      setCommentsCount((prevCount) => prevCount + 1);
      setCommentValue('');
      commentCountsMadeByUser[confession._id] += 1;
      setCommentCountsMadeByUser({ ...commentCountsMadeByUser });
      localStorage.setItem('commentCountsMadeByUser', JSON.stringify(commentCountsMadeByUser));

      // Send comment to the server
      const commentResponse = await fetch('/api/confession/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (commentResponse.ok) {
        // Optionally update the comment with the real ID if needed
      } else {
        console.error('Error submitting comment');
        // Revert the optimistic update if there was an error
        setComments((prevComments) =>
          prevComments.filter(
            (comment) => comment._id !== optimisticComment._id
          )
        );
        setCommentsCount((prevCount) => prevCount - 1);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const replyToComment = async (commentId, replyContent) => {
    try {
      if (!userDetails) {
        // Open the authentication prompt
        handleOpenAuthPrompt(true);
        return;
      }
      if (!replyCountsMadeByUser[commentId]) {
        replyCountsMadeByUser[commentId] = 0;
      }

      if (replyCountsMadeByUser[commentId] >= 1) {
        alert('You can only make 1 reply per comment.');
        return;
      }
      const { gender, mid } = userDetails;

      // Optimistic update: Add reply to the comments array immediately
      const optimisticReply = {
        _id: new Date().toISOString(),
        gender,
        replyContent,
        mid,
        likes: [], // Assuming you have a likes array for replies
      };

      const updatedComments = comments.map(comment =>
        comment._id === commentId
          ? {
            ...comment,
            replies: [...(comment.replies || []), optimisticReply],
          }
          : comment
      );

      setComments(updatedComments);

      const dataToSend = {
        commentId,
        replyContent,
        gender,
        mid,
      };

      // Send the reply data to the server
      const replyResponse = await fetch('/api/confession/replytocomment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      replyCountsMadeByUser[commentId] += 1;
      setReplyCountsMadeByUser({ ...replyCountsMadeByUser });
      localStorage.setItem('replyCountsMadeByUser', JSON.stringify(replyCountsMadeByUser));

      if (replyResponse.ok) {
        // Reply submitted successfully
        // Optionally, you can update the UI to reflect the new reply
      } else {
        console.error('Error submitting reply');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const likecomment = async (id) => {
    try {
      // Check if user is authenticated
      if (!userDetails) {
        // Handle authentication prompt
        handleOpenAuthPrompt(true);
        return;
      }

      // Check if the user has already liked the comment
      const likedIndex = comments.findIndex(comment => comment._id === id && comment?.likes?.includes(userDetails.mid));

      if (likedIndex !== -1) {
        // User already liked the comment, so unlike it
        const updatedLikes = [...comments[likedIndex].likes];
        updatedLikes.splice(updatedLikes.indexOf(userDetails.mid), 1);
        const updatedComment = { ...comments[likedIndex], likes: updatedLikes };
        const updatedComments = [...comments];
        updatedComments[likedIndex] = updatedComment;
        setComments(updatedComments);
      } else {
        // User hasn't liked the comment, so like it
        const updatedLikes = [...comments.find(comment => comment._id === id).likes, userDetails.mid];
        const updatedComment = { ...comments.find(comment => comment._id === id), likes: updatedLikes };
        const updatedComments = comments.map(comment => (comment._id === id ? updatedComment : comment));
        setComments(updatedComments);
      }

      // Save like operation locally (for offline support)
      localStorage.setItem('pendingLikeOperation', JSON.stringify({ mid: userDetails.mid, commentId: id }));

      // Call API to like comment
      const response = await fetch('/api/confession/likecomment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mid: userDetails.mid, commentId: id }),
      });

      if (!response.ok) {
        throw new Error('Error liking/unliking comment');
      }
    } catch (error) {
      console.error('Error liking/unliking comment:', error);
      // Revert the optimistic update if there was an error
      const updatedComments = comments.map(comment => {
        if (comment._id === id) {
          // Remove the user's mid from the likes array
          const updatedLikes = comment.likes.filter(mid => mid !== userDetails.mid);
          return { ...comment, likes: updatedLikes };
        }
        return comment;
      });
      setComments(updatedComments);
    }
  };

  const likereply = async (commentId, replyId) => {
    try {
      // Check if user is authenticated
      if (!userDetails) {
        // Handle authentication prompt
        handleOpenAuthPrompt(true);
        return;
      }

      // Find the comment containing the reply
      const commentIndex = comments.findIndex(comment => comment._id === commentId);
      if (commentIndex === -1) return;

      const replyIndex = comments[commentIndex].replies.findIndex(reply => reply._id === replyId);
      if (replyIndex === -1) return;

      const reply = comments[commentIndex].replies[replyIndex];

      // Check if the user has already liked the reply
      const hasLiked = reply.likes.includes(userDetails.mid);

      if (hasLiked) {
        // Unlike the reply
        const updatedLikes = reply.likes.filter(mid => mid !== userDetails.mid);
        const updatedReply = { ...reply, likes: updatedLikes };
        const updatedComments = [...comments];
        updatedComments[commentIndex].replies[replyIndex] = updatedReply;
        setComments(updatedComments);
      } else {
        // Like the reply
        const updatedLikes = [...reply.likes, userDetails.mid];
        const updatedReply = { ...reply, likes: updatedLikes };
        const updatedComments = [...comments];
        updatedComments[commentIndex].replies[replyIndex] = updatedReply;
        setComments(updatedComments);
      }

      // Save like operation locally (for offline support)
      localStorage.setItem('pendingReplyLikeOperation', JSON.stringify({ mid: userDetails.mid, commentId, replyId }));

      // Call API to like/unlike reply
      const response = await fetch('/api/confession/likereply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mid: userDetails.mid, commentId, replyId }),
      });

      if (!response.ok) {
        throw new Error('Error liking/unliking reply');
      }
    } catch (error) {
      console.error('Error liking/unliking reply:', error);
      // Revert the optimistic update if there was an error
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply._id === replyId) {
              // Remove the user's mid from the likes array
              const updatedLikes = reply.likes.filter(mid => mid !== userDetails.mid);
              return { ...reply, likes: updatedLikes };
            }
            return reply;
          });
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });
      setComments(updatedComments);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `/api/getdetails/getcomments?confessionId=${confession._id}`
        );
        if (response.ok) {
          const { comments } = await response.json();
          setComments(comments);
          setCommentsCount(comments.length);
        } else {
          console.error('Error fetching comments:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [confession, userDetails]);

  const handleClick = () => {
    if (isSmallDevice) {
      openAnonymousReplyDialog();
    }
  };

  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  // Handlers for delete dialog
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
      onDelete(confession);
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <div ref={ref} className={styles.mainDiv} style={{ position: 'relative' }}>
      <ConfessionBox
        gender={gender}
        applyGenderBasedGrandients={applyGenderBasedGrandients}
        confession={confession}
        userDetails={userDetails}
        commentsCount={commentsCount}
        toggleCommentsDialog={toggleCommentsDialog}
        handleClick={handleClick}
        handleOpenAuthPrompt={handleOpenAuthPrompt}
        isAdmin={isAdmin}
        ondeleteClick={handleDeleteClick}
      />

      {/* <ConfessionFooter
        confession={confession}
        userDetails={userDetails}
        commentsCount={commentsCount}
        toggleCommentsDialog={toggleCommentsDialog}
        handleClick={handleClick}
        handleOpenAuthPrompt={handleOpenAuthPrompt}
        isAdmin={isAdmin}
        ondeleteClick={handleDeleteClick}
      /> */}


      <AuthPrompt open={isAuthPromptOpen} onClose={handleCloseAuthPrompt} />

      <CommentsDialog
        isOpen={isCommentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        comments={comments}
        commentValue={commentValue}
        handleCommentSubmit={handleCommentSubmit}
        setCommentValue={setCommentValue}
        replyToComment={replyToComment}
        likecomment={likecomment}
        likereply={likereply}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this confession? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Confession;
