// pages/verifyotp.js
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useSession } from 'next-auth/react';
import { createTheme, ThemeProvider, Select, MenuItem, TextField, Button, InputLabel } from '@mui/material';
import Image from 'next/image';
import styles from './signup.module.css'




const mymtheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(45, 45, 45)',
    },
  },
});


const VerifyOTP = () => {
  const router = useRouter();
  const [enteredOTP, setEnteredOTP] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOTPSent] = useState(false);
  const [wait30sec, setWait30sec] = useState(false);

  const { data: session } = useSession();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    try {
      setError(null);

      if (!enteredOTP) {
        throw new Error('Please enter the OTP.');
      }

      setLoading(true);

      // Validate OTP through API (replace with your actual API endpoint)
      const response = await fetch('/api/security/validate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session?.user?.email, otp: enteredOTP }), // Use the email from session
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

  const handleResendOTP = async () => {
    try {
      // Send OTP through API for resending (replace with your actual API endpoint)
      const resendResponse = await fetch('/api/security/sendotp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session?.user?.email }), // Use the email from session
      });

      const resendData = await resendResponse.json();

      if (!resendResponse.ok) {
        throw new Error(resendData.error || 'Failed to resend OTP.');
      }

      setOTPSent(true); // Set this to true to show the button after OTP is sent
      setWait30sec(true); // Disable the Resend OTP button for 30 seconds

      // Set a timer to re-enable the Resend OTP button after 30 seconds
      setTimeout(() => {
        setWait30sec(false);
      }, 30000);
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Failed to resend OTP. Please try again.');
    }
  };




  return (
    <ThemeProvider theme={mymtheme}>
      <div className={styles.mainContainer} >
        {/* <div className={styles.macpng}>
          <Image src={'/images/large_pngs/macbook_chat.png'} width={2400} height={1476} alt='preview'></Image>
        </div> */}
        <div className={styles.mainBox}>
          <Image src={'/images/mym_logos/mymshadow.png'} width={1232} height={656} alt='mym' className={styles.mymLogo}></Image>
          {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
          <form onSubmit={handleVerifyOTP} className={styles.form}>
            <TextField
              type="text"
              label="Enter OTP"
              value={enteredOTP}
              required
              variant='standard'
              onChange={(e) => setEnteredOTP(e.target.value)}
              InputLabelProps={{
                required: false, // Remove the asterisk for the Email field
              }}
              className={styles.input}

            />

            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              color="primary"
              className={styles.button}
            >
              {loading ? <CircularProgress style={{ fontSize: '1rem', width: '1rem', height: '1rem' }} /> : 'Verify'}
            </Button>
            <Button
              onClick={handleResendOTP}
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

export default VerifyOTP;