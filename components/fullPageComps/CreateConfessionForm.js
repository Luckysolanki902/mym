import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../componentStyles/createconfessionform.module.css';
import { CircularProgress, Snackbar } from '@mui/material';
import WarningDialog from '../dialogs/WarningDialog';
import Image from 'next/image';

const CreateConfessionForm = ({ userDetails }) => {
  const [confessionValue, setConfessionValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({});
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const router = useRouter();

  const handleConfessionSubmit = async () => {
    try {
      setLoading(true);

      const { college, gender, mid } = userDetails;
      const dataToSend = {
        mid: mid,
        college,
        gender,
        confessionContent: confessionValue,
      };

      const moderationResponse = await fetch('/api/confession/content-moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!moderationResponse.ok) {
        throw new Error('Error checking content moderation');
      }

      const moderationResult = await moderationResponse.json();

      if (moderationResult.isFitForSubmission) {
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

        // Show success snackbar
        setSuccessSnackbarOpen(true);

        // Redirect to thank you page with confessionId
        router.push(`/thank-you/${confessionId}`);
      } else {
        setDialogContent({
          problematicSentences: moderationResult.problematicSentences,
          warning: moderationResult.warning,
          advice: moderationResult.advice
        });
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSuccessSnackbarOpen(false);
  };

  return (
    <div className={styles.mainDiv}>
      <div className={`${styles.mainContainer} ${userDetails ? styles[`${userDetails.gender}Gradient`] : ''}`}>
        <textarea
          autoComplete="off"
          spellCheck="false"
          autoCorrect='off'
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

      {/* Custom Dialog for displaying warnings and advice */}
      <WarningDialog open={dialogOpen} onClose={handleDialogClose} content={dialogContent} />

      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Confession submitted successfully"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ backgroundColor: '#43a047' }} // Customizing background color
      />
    </div>
  );
};

export default CreateConfessionForm;
