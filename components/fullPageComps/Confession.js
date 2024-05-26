import React, { useState, useEffect, useRef } from 'react';
import styles from '../componentStyles/confession.module.css';
import { IoIosSend } from 'react-icons/io';
import { useMediaQuery } from '@mui/material';
import { useInView } from 'react-intersection-observer';
import AuthPrompt from '@/components/commonComps/AuthPrompt';
// import { getRandomCommentAvatar } from '@/utils/avtarUtils';
import CommentsDialog from '../confessionComps/CommentsDialog';
import ConfessionBox from '../confessionComps/ConfessionBox';
import ConfessionFooter from '../confessionComps/ConfessionFooter';
// import { getSession } from 'next-auth/react';
const Confession = ({ confession, userDetails, applyGenderBasedGrandients }) => {

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

      const { gender } = userDetails;

      const dataToSend = {
        gender,
        confessionId: confession._id,
        commentContent: commentValue,
      };

      // Optimistic UI update
      const optimisticComment = {
        _id: new Date().toISOString(), // Use a temporary ID until the server confirms
        confessionId: confession._id,
        commentContent: commentValue,
        gender: userDetails.gender,
      };

      setComments((prevComments) => [optimisticComment, ...prevComments]);
      setCommentsCount((prevCount) => prevCount + 1);
      setCommentValue('');
      commentCountsMadeByUser[confession._id] += 1;
      setCommentCountsMadeByUser({ ...commentCountsMadeByUser });
      localStorage.setItem('commentCountsMadeByUser', JSON.stringify(commentCountsMadeByUser));

      // const session = await getSession();
      const commentResponse = await fetch('/api/confession/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (commentResponse.ok) {
        // console.log('Comment submitted successfully');
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
      const { gender } = userDetails;
  
      // Optimistic update: Add reply to the comments array immediately
      const optimisticReply = {
        _id: new Date().toISOString(),
        gender,
        replyContent,
        likes: [], // Assuming you have a likes array for replies
      };
  
      const updatedComments = comments.map(comment =>
        comment._id === commentId
          ? {
              ...comment,
              replies: [...comment?.replies, optimisticReply],
            }
          : comment
      );
  
      setComments(updatedComments);
  
      const dataToSend = {
        commentId,
        replyContent,
        gender,
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
        console.log('Reply submitted successfully');
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
      const likedIndex = comments.findIndex(comment => comment._id === id && comment?.likes?.includes(userDetails.email));

      if (likedIndex !== -1) {
        // User already liked the comment, so unlike it
        const updatedLikes = [...comments[likedIndex].likes];
        updatedLikes.splice(updatedLikes.indexOf(userDetails.email), 1);
        const updatedComment = { ...comments[likedIndex], likes: updatedLikes };
        const updatedComments = [...comments];
        updatedComments[likedIndex] = updatedComment;
        setComments(updatedComments);
      } else {
        // User hasn't liked the comment, so like it
        const updatedLikes = [...comments.find(comment => comment._id === id).likes, userDetails.email];
        const updatedComment = { ...comments.find(comment => comment._id === id), likes: updatedLikes };
        const updatedComments = comments.map(comment => (comment._id === id ? updatedComment : comment));
        setComments(updatedComments);
      }

      // Save like operation locally (for offline support)
      localStorage.setItem('pendingLikeOperation', JSON.stringify({ email: userDetails.email, commentId: id }));

      // Call API to like comment
      const response = await fetch('/api/confession/likecomment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userDetails.email, commentId: id }),
      });

      if (!response.ok) {
        throw new Error('Error liking/unliking comment');
      }
    } catch (error) {
      console.error('Error liking/unliking comment:', error);
      // Revert the optimistic update if there was an error
      const updatedComments = comments.map(comment => {
        if (comment._id === id) {
          // Remove the user's email from the likes array
          comment?.likes?.splice(comment.likes.indexOf(userDetails.email), 1);
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

      // Check if the user has already liked the reply
      const likedIndex = comments.findIndex(comment => comment._id === commentId && comment?.replies?.some(reply => reply._id === replyId && reply.likes.includes(userDetails.email)));

      if (likedIndex !== -1) {
        // User already liked the reply, so unlike it
        const updatedReplies = [...comments[likedIndex].replies];
        const replyIndex = updatedReplies.findIndex(reply => reply._id === replyId);
        updatedReplies[replyIndex] = { ...updatedReplies[replyIndex], likes: updatedReplies[replyIndex].likes.filter(email => email !== userDetails.email) };
        const updatedComment = { ...comments[likedIndex], replies: updatedReplies };
        const updatedComments = [...comments];
        updatedComments[likedIndex] = updatedComment;
        setComments(updatedComments);
      } else {
        // User hasn't liked the reply, so like it
        const updatedReplies = [...comments.find(comment => comment._id === commentId).replies];
        const replyIndex = updatedReplies.findIndex(reply => reply._id === replyId);
        updatedReplies[replyIndex] = { ...updatedReplies[replyIndex], likes: [...updatedReplies[replyIndex].likes, userDetails.email] };
        const updatedComment = { ...comments.find(comment => comment._id === commentId), replies: updatedReplies };
        const updatedComments = comments.map(comment => (comment._id === commentId ? updatedComment : comment));
        setComments(updatedComments);
      }

      // Save like operation locally (for offline support)
      localStorage.setItem('pendingReplyLikeOperation', JSON.stringify({ email: userDetails.email, commentId, replyId }));

      // Call API to like reply
      const response = await fetch('/api/confession/likereply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userDetails.email, commentId, replyId }),
      });

      if (!response.ok) {
        throw new Error('Error liking/unliking reply');
      }
    } catch (error) {
      console.error('Error liking/unliking reply:', error);
      // Revert the optimistic update if there was an error
      const updatedComments = comments.map(comment => {
        const updatedReplies = comment?.replies?.map(reply => {
          if (reply._id === replyId) {
            // Remove the user's email from the likes array
            reply?.likes?.splice(reply.likes.indexOf(userDetails.email), 1);
          }
          return reply;
        });
        return { ...comment, replies: updatedReplies };
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
          // const commentAvatars = comments.map((comment) =>
          //     getRandomCommentAvatar(comment._id, comment.gender)
          // );
          // setCommentAvatars(commentAvatars);
          setComments(comments);
          setCommentsCount(comments.length);
        } else {
          console.error('Error fetching comments:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments()
  }, [confession, userDetails])



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

      <ConfessionBox
        gender={gender}
        applyGenderBasedGrandients={applyGenderBasedGrandients}
        confession={confession}
      />

      <ConfessionFooter
        confession={confession}
        userDetails={userDetails}
        commentsCount={commentsCount}
        toggleCommentsDialog={toggleCommentsDialog}
        handleClick={handleClick}
        handleOpenAuthPrompt={handleOpenAuthPrompt}
      />


      <AuthPrompt open={isAuthPromptOpen} onClose={handleCloseAuthPrompt} />


      <CommentsDialog
        isOpen={isCommentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        comments={comments}
        // commentAvatars={commentAvatars}
        commentValue={commentValue}
        handleCommentSubmit={handleCommentSubmit}
        setCommentValue={setCommentValue}
        replyToComment={replyToComment}
        likecomment={likecomment}
        likereply={likereply}
      />

      {/* Anon. dialog________________ */}


    </div>
  );
};

export default Confession;
