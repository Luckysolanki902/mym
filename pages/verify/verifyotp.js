// pages/verifyotp.js
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import styles from '@/styles/signup.module.css';
import { useSession } from 'next-auth/react';

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
      router.push('/textchat');
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', backgroundColor: 'black', color: 'white' }}>
      <div style={{ background: 'black', padding: '30px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Verify Email</h1>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
        <form onSubmit={handleVerifyOTP}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={enteredOTP}
            required
            onChange={(e) => setEnteredOTP(e.target.value)}
            style={{ marginBottom: '15px', padding: '10px', width: '100%' }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              width: '100%',
              cursor: 'pointer',
              backgroundColor: 'green',
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress style={{ fontSize: '1rem', width: '1rem', height: '1rem' }} /> : 'Verify Email'}
          </button>
        </form>
        <div className={styles.resendOTP} style={{ marginTop: '15px', textAlign: 'center' }}>
            <button
              style={{
                backgroundColor: 'blue',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px',
                width: '100%',
                cursor: 'pointer',
                backgroundColor: 'black',
                margin: '1rem 0',
                border: '1px solid white',
              }}
              onClick={handleResendOTP}
              disabled={wait30sec}
            >
              {wait30sec ? `Resend OTP in 30s` : 'Resend OTP'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;