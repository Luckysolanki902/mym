import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider, TextField, Button } from '@mui/material';
import Image from 'next/image';
import styles from './signup.module.css';
import { getSession } from 'next-auth/react';

const mymtheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(45, 45, 45)',
    },
  },
});

const VerifyOTP = ({ session }) => {
  const router = useRouter();
  const [enteredOTP, setEnteredOTP] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOTPSent] = useState(false);
  const [wait30sec, setWait30sec] = useState(false);

  useEffect(() => {
    // Send OTP when the component mounts
    sendOTP();
  }, []);

  const sendOTP = async () => {
    try {
      const resendResponse = await fetch('/api/security/sendotp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session?.user?.email }),
      });

      const resendData = await resendResponse.json();

      if (!resendResponse.ok) {
        throw new Error(resendData.error || 'Failed to send OTP.');
      }

      setOTPSent(true);
      setWait30sec(true);

      setTimeout(() => {
        setWait30sec(false);
      }, 30000);
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    try {
      setError(null);

      if (!enteredOTP) {
        throw new Error('Please enter the OTP.');
      }

      setLoading(true);

      const response = await fetch('/api/security/validate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session?.user?.email, otp: enteredOTP }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP.');
      }

      setLoading(false);

      // Redirect to textchat page if OTP verification succeeds
      router.push('/');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error.message || 'Failed to verify OTP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={mymtheme}>
      <div className={styles.mainContainer}>
        <div className={styles.mainBox}>
          <Image src={'/images/mym_logos/mymshadow.png'} width={1232} height={656} alt='mym' className={styles.mymLogo} />
          {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
          <form onSubmit={handleVerifyOTP} className={styles.form}>
            <TextField
              type="text"
              label="Email"
              value={session?.user?.email || ''}
              required
              variant='standard'
              disabled
            />
            <TextField
              type="text"
              label="Enter OTP"
              value={enteredOTP}
              required
              variant='standard'
              onChange={(e) => setEnteredOTP(e.target.value)}
            />

            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              color="primary"
            >
              {loading ? <CircularProgress style={{ fontSize: '1rem', width: '1rem', height: '1rem' }} /> : 'Verify'}
            </Button>
            <Button
              onClick={sendOTP}
              disabled={wait30sec}
              variant="text"
              color="primary"
            >
              {wait30sec ? `Resend OTP in 30s` : 'Resend OTP'}
            </Button>
          </form>
        </div>
      </div>
    </ThemeProvider>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
}

export default VerifyOTP;
