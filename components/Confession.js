import React, { useState, useEffect } from 'react';
import styles from './componentStyles/confession.module.css';
import Image from 'next/image';
import { FaHeart, FaComment, FaTimes } from 'react-icons/fa';
import Avatar from 'avataaars';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { IoSend } from "react-icons/io5";





const Confession = ({ confession, userDetails }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(confession.likes.length);
  const [commentAvatars, setCommentAvatars] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentValue, setCommentValue] = useState('');
  const [commentsCount, setCommentsCount] = useState('')
  const [isCommentDialogOpen, setCommentDialogOpen] = useState(false);
  const getRandomOption = (options) => {
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  };

  const getRandomColor = () => {
    const colors = ['black', 'blue01', 'blue02', 'blue03', 'gray01', 'gray02', 'heather', 'pastelBlue', 'pastelGreen', 'pastelOrange', 'pastelRed', 'pastelYellow', 'pink', 'red', 'white'];
    return getRandomOption(colors);
  };

  const optionsForMale = ['ShortHairShortWaved', 'ShortHairShortCurly', 'ShortHairShaggyMullet']
  const optionsForFemale = ['LongHairMiaWallace', 'LongHairBigHair', 'LongHairBob', 'LongHairCurly', 'LongHairCurvy', 'LongHairNotTooLong', 'LongHairStraight', 'LongHairStraight2', 'LongHairStraightStrand']
  const getRandomAvatarProperties = (gender = 'male') => {
    const options = gender === 'male' ? optionsForMale : optionsForFemale;
    return {
      background: getRandomColor(),
      svgBackground: getRandomColor(),
      skin: 'light',
      topType: getRandomOption(options),
      accessoriesType: getRandomOption(['Wayfarers', 'Blank', 'Kurt', 'Prescription01', 'Prescription02', 'Round', 'Sunglasses']),
      hairColor: getRandomOption(['BrownDark', 'Brown', 'BlondeGolden', 'Blonde', 'Black', 'Auburn']),
      clotheType: getRandomOption(['Hoodie', 'BlazerShirt', 'BlazerSweater', 'CollarSweater', 'GraphicShirt', 'ShirtCrewNeck', 'ShirtVNeck', 'ShirtScoopNeck']),
      clotheColor: getRandomOption(['Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02', 'Heather', 'PastelBlue', 'PastelGreen', 'PastelRed', 'PastelOrange', 'PastelYellow', 'Pink', 'Red', 'White']),
      eyeType: getRandomOption(['Close', 'Default', 'Dizzy', 'EyeRoll', 'Happy', 'Side', 'Wink', 'WinkWacky']),
      eyebrowType: getRandomOption(['Angry', 'AngryNatural', 'Default', 'DefaultNatural', 'FlatNatural', 'RaisedExcited', 'RaisedExcitedNatural', 'SadConcerned', 'SadConcernedNatural']),
      mouthType: getRandomOption(['Smile', 'Twinkle', 'Tongue', 'Serious', 'Disbelief', 'Default', 'ScreamOpen']),
    };
  };



  const getRandomCommentAvatar = (commentId, gender) => {
    const avatarProperties = getRandomAvatarProperties(gender);
    return { ...avatarProperties, key: `avatar_${commentId}_${Date.now()}` };
  };
  const toggleCommentsDialog = () => {
    setCommentDialogOpen(!isCommentDialogOpen);
  };


  useEffect(() => {
    // Fetch likes for the confession
    const fetchLikes = async () => {
      try {
        const response = await fetch(`/api/getdetails/getlikes?confessionId=${confession._id}`);

        if (response.ok) {
          const { likes } = await response.json();
          setLiked(likes.some((like) => like.userEmail === userDetails?.email));
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
        const response = await fetch(`/api/getdetails/getcomments?confessionId=${confession._id}`);

        if (response.ok) {
          const { comments } = await response.json();
          const commentAvatars = comments.map((comment) => getRandomCommentAvatar(comment._id, comment.gender));
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
      // Optimistic UI update
      setLiked(!liked);
      setLikesCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));

      const likeOperation = {
        email: userDetails?.email,
        confessionId: confession._id,
        liked: !liked,
      };

      // Save like operation locally (for offline support)
      localStorage.setItem('pendingLikeOperation', JSON.stringify(likeOperation));

      const response = await fetch(`/api/likeconfession`, {
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
      setCommentsCount((prevCount) => (prevCount + 1))
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
        setComments((prevComments) => prevComments.filter((comment) => comment._id !== optimisticComment._id));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={styles.mainDiv}>
      <div className={styles.mainContainer}>
        <div className={styles.textarea}>
          {confession.confessionContent}
        </div>
        <div style={{ textAlign: 'right', margin: '1rem 0' }} className={styles.masks}>
          <Image src={'/images/othericons/masks.png'} width={512} height={512} alt='' />
        </div>
      </div>
      <div className={styles.confessionfooter}>
        <div className={styles.likes} onClick={handleLike} style={{ cursor:'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaHeart style={{ color: liked ? 'red' : 'white', width: '2rem', height: 'auto', }} />
          </div>
          <div>{likesCount}</div>
        </div>
        <div className={styles.likes} onClick={toggleCommentsDialog} style={{ cursor:'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaComment style={{ color: 'white', width: '2rem', height: 'auto',}} />
          </div>
          <div>{commentsCount}</div>
        </div>
        <div className={styles.reply}><input className={styles.anonymInput} type="text" placeholder='Send a message anonymously...' /></div>
      </div>

      <Dialog open={isCommentDialogOpen} onClose={toggleCommentsDialog} fullWidth maxWidth="md">
        <DialogTitle>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Comments
            <FaTimes style={{ cursor: 'pointer' }} onClick={toggleCommentsDialog} />
          </div>
        </DialogTitle>
        <DialogContent style={{display:'flex', flexDirection:'column', height:'100%'}}>
          {/* Comment input and display */}
          <div className={styles.comments} style={{flex:'1',overflowY: 'auto', marginBottom:'1rem'}}>
            <div className={styles.comments}>

              {comments.map((comment, index) => (
                <div key={comment._id} className={styles.comment}>
                  <div className={styles.avatar}>
                    <Avatar
                      style={{ width: '30px', height: '30px' }}
                      avatarStyle='Circle'
                      {...commentAvatars[index]} />
                  </div>
                  <div className={styles.commentContent}>
                    <strong>Stranger:</strong> {comment.commentContent}
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
            />
            <button
              className={styles.comBtn}
              variant="contained"
              color="primary"
              onClick={handleCommentSubmit}
              disabled={commentValue.trim() === ''}
              style={{ height: '100%', cursor:'pointer'}}
            >
              <IoSend style={{width:'100%', height:'auto'}}/>
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Confession;
