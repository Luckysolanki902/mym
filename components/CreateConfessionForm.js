import React, { useState, useEffect } from 'react';
import styles from './componentStyles/createconfessionform.module.css';
import { CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';


const CreateConfessionForm = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [confessionValue, setConfessionValue] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
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

      const confessResponse = await fetch('/api/confession/confess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (confessResponse.ok) {
        console.log('Confession submitted successfully');
        setConfessionValue('');
        setLoading(false);
      } else {
        console.error('Error submitting confession');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.mainDiv}>
      <div className={styles.mainContainer}>
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
