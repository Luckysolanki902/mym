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
        gender: userDetails.gender,
      };

      setComments((prevComments) => [optimisticComment, ...prevComments]);
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

  useEffect(()=>{
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
      />

      {/* Anon. dialog________________ */}


    </div>
  );
};

export default Confession;
