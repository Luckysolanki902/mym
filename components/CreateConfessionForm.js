import React, { useState, useEffect } from 'react';
import styles from './componentStyles/createconfessionform.module.css';
import { CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';


const CreateConfessionForm = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [confessionValue, setConfessionValue] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    if (userEmail) {
      fetchUserDetails(userEmail);
    }
  }, [userEmail]);

  const fetchUserDetails = async (email) => {
    try {
      const response = await fetch(`/api/getdetails/getuserdetails?userEmail=${email}`);
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const userData = await response.json();
      setUserDetails(userData);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    router.replace('/signin');
    return null;
  }

  const handleConfessionSubmit = async () => {
  try {
    setLoading(true);

    // Generate a random UUID

    const { email, college, gender } = userDetails;
    const dataToSend = {
      email: email,
      college,
      gender,
      confessionContent: confessionValue,
    };

    // Submit the confession
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

    // Retrieve the confessionId from the response
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
          <button className={styles.confessButton} onClick={handleConfessionSubmit} disabled={confessionValue.trim()===''}>
            {loading ? <CircularProgress size={20} /> : 'Confess'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateConfessionForm;
