import React, { useState, useEffect } from 'react';
import styles from './componentStyles/confession.module.css';
import { CircularProgress } from '@mui/material';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';

const Confession = ({ confession, userDetails }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(confession.likes.length);

  useEffect(() => {
    setLiked(confession.likes.includes(userDetails?.email));
    setLikesCount(confession.likes.length);
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
        <div className={styles.likes} onClick={handleLike}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaHeart style={{ color: liked ? 'red' : 'white', width: '2rem', height: 'auto' }} />
          </div>
          <div>{likesCount}</div>
        </div>
        <div className={styles.reply}><input type="text" placeholder='Send a message anonymously...' /></div>
      </div>
    </div>
  );
};

export default Confession;
