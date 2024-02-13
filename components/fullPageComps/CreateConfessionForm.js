import React, { useState } from 'react';
import styles from '../componentStyles/createconfessionform.module.css';
import { CircularProgress } from '@mui/material';

const CreateConfessionForm = ({ userDetails }) => {
  const [confessionValue, setConfessionValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfessionSubmit = async () => {
    try {
      setLoading(true);

      const { email, college, gender } = userDetails;
      const dataToSend = {
        email: email,
        college,
        gender,
        confessionContent: confessionValue,
      };

      const confessResponse = await fetch('/api/confession/confess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!confessResponse.ok) {
        throw new Error('Error submitting confession');
      }

      const { confessionId } = await confessResponse.json();

      // Create an entry in PersonalReply model
      const personalReplyResponse = await fetch('/api/confession/personalreply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confessionId,
          confesserEmail: email,
        }),
      });

      if (personalReplyResponse.ok) {
        console.log('Confession submitted successfully');
        setConfessionValue('');
      } else {
        console.error('Error creating PersonalReply entry');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.mainDiv}>
      <div className={`${styles.mainContainer} ${userDetails ? styles[`${userDetails.gender}Gradient`] : ''}`}>
        <textarea
          name="confessionContent"
          id="confessioncontentbox"
          placeholder="Start writing..."
          value={confessionValue}
          onChange={(e) => setConfessionValue(e.target.value)}
          className={styles.textarea}
        ></textarea>
        <div style={{ textAlign: 'right', margin: '1rem 0' }}>
          <button className={styles.confessButton} onClick={handleConfessionSubmit} disabled={confessionValue.trim() === ''}>
            {loading ? <CircularProgress size={20} /> : 'Confess'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateConfessionForm;
