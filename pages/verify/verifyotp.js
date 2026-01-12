// pages/verify/verifyotp.js
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { clearSignupData, setOtpToken, setOtpSentAt } from '@/store/slices/signupSlice';
import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider, TextField, Button, Alert } from '@mui/material';
import SpyllWordmark from '@/components/commonComps/SpyllWordmark';
import styles from './verifyotp.module.css'; // Ensure you have appropriate styles
import CustomHead from '@/components/seo/CustomHead';
import Link from 'next/link';
import { signIn } from 'next-auth/react'; // Import signIn from NextAuth

const COOLDOWN_SECONDS = 30;

const spylltheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(45, 45, 45)',
    },
  },
});

const VerifyOTP = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const signupData = useSelector((state) => state.signup);

  const [enteredOTP, setEnteredOTP] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [waitTimeLeft, setWaitTimeLeft] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    // On component mount, check if OTP was sent and calculate remaining cooldown
    if (signupData.otpSentAt) {
      const now = Date.now();
      const sentAt = new Date(signupData.otpSentAt).getTime();
      const elapsedSeconds = Math.floor((now - sentAt) / 1000);
      if (elapsedSeconds < COOLDOWN_SECONDS) {
        setWaitTimeLeft(COOLDOWN_SECONDS - elapsedSeconds);
        const timer = setInterval(() => {
          const newElapsedSeconds = Math.floor((Date.now() - sentAt) / 1000);
          const newWaitTime = COOLDOWN_SECONDS - newElapsedSeconds;
          if (newWaitTime <= 0) {
            setWaitTimeLeft(0);
            clearInterval(timer);
          } else {
            setWaitTimeLeft(newWaitTime);
          }
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [signupData.otpSentAt]);

  const sendOTP = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      setLoading(true);

      const response = await fetch('/api/security/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: signupData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      // Update the OTP token and sent timestamp in Redux
      dispatch(setOtpToken(data.token));
      dispatch(setOtpSentAt(new Date().toISOString()));

      setWaitTimeLeft(COOLDOWN_SECONDS);
      setSuccessMessage('A new OTP has been sent to your email.');

      // Start the cooldown timer
      const timer = setInterval(() => {
        setWaitTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    try {
      setError(null);
      setSuccessMessage(null);

      if (!enteredOTP) {
        throw new Error('Please enter the OTP.');
      }

      setLoading(true);

      const response = await fetch('/api/security/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enteredOTP,
          token: signupData.otpToken,
          password: signupData.password,
          gender: signupData.gender,
          college: signupData.college,
          isTestId: signupData.isTestId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP.');
      }

      setSuccessMessage('Verifying and signing you in...');

      // Attempt to sign in the user
      const signInResponse = await signIn('credentials', {
        redirect: false, // Prevent automatic redirection
        email: signupData.email,
        password: signupData.password,
      });

      if (signInResponse.error) {
        throw new Error(signInResponse.error);
      }

      // Clear signup data from Redux
      dispatch(clearSignupData());

      // Redirect to main page or dashboard
      router.push('/');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If signupData is incomplete, redirect back to signup
  useEffect(() => {
    if (!signupData.email || !signupData.password || !signupData.gender || !signupData.college) {
      router.push('/auth/signup');
    }
  }, [signupData, router]);

  return (
    <>
      <CustomHead title={'Verify OTP - Spyll'} />

      <ThemeProvider theme={spylltheme}>
        <div className={styles.mainContainer}>
          <div className={styles.mainBox}>
            <SpyllWordmark className={styles.spyllLogo} />
            {error && (
              <Alert severity="error" style={{ marginBottom: '15px' }}>
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" style={{ marginBottom: '15px' }}>
                {successMessage}
              </Alert>
            )}
            <form onSubmit={handleVerifyOTP} className={styles.form}>
              <TextField
                type="email"
                label="Email"
                value={signupData.email || ''}
                required
                variant='standard'
                disabled
                className={styles.input}
              />
              <TextField
                type="text"
                label="Enter OTP"
                value={enteredOTP}
                required
                variant='standard'
                onChange={(e) => setEnteredOTP(e.target.value)}
                className={styles.input}
              />

              <Button
                type="submit"
                disabled={loading}
                variant="contained"
                color="primary"
                className={styles.button}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify'}
              </Button>
              <Button
                onClick={sendOTP}
                disabled={waitTimeLeft > 0 || loading}
                variant="text"
                color="primary"
                className={styles.button}
                sx={{ marginBottom: '1rem' }}
              >
                {waitTimeLeft > 0 ? `Resend OTP in ${waitTimeLeft}s` : 'Resend OTP'}
              </Button>
            </form>
            <div className={styles.line}></div>
            <div
              onClick={() => router.push('/auth/signup')}
              className={styles.paraLink}
              style={{ cursor: 'pointer' }}
            >
              <span style={{ marginRight: '0.5rem' }}>Need to edit your information?</span>
              <span style={{ color: 'rgb(50, 50, 50)', fontWeight: '800' }}>Edit</span>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </>
  );
};

export default VerifyOTP;
