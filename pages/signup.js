// pages/signup.js
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styles from '@/styles/signup.module.css'; // Import CSS module
import CircularProgress from '@mui/material/CircularProgress';

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [college, setCollege] = useState('');
  const [error, setError] = useState(null);
  const [otpSent, setOTPSent] = useState(false);
  const [accMade, setAccMade] = useState(false)
  const [enteredOTP, setEnteredOTP] = useState('');
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false);
  const [otpsentagain, setotpsentagain] = useState(false)

  const colleges = ['HBTU Kanpur', 'IIT Kanpur'];
  const generateOtp = () => {
    const generatedOTP = Math.floor(100000 + Math.random() * 900000);
    setOtp(generatedOTP);
    return generatedOTP;
  }



  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      setError(null);
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, gender, college }),
      });
      console.log('successful signup');

      setAccMade(true);

      // Send OTP after setting OTP state
      const generatedOTP = otp.toString();
      await sendOTP();

      setOTPSent(true);
      setLoading(false);
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const sendOTP = async () => {
    try {
      setEnteredOTP('')
      setotpsentagain(false)
      const generatedOTP = generateOtp(); // Call generateOtp function to get the OTP
      setOtp(generatedOTP);
      const userData = { email, otp: generatedOTP };
      const response = await fetch('/api/sendotp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP. Please try again.');
      }

      console.log('OTP sent successfully:');
      setotpsentagain(true)
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.'); // Handle error while sending OTP
    }
  };


  const handleVerifyOTP = async () => {
    try {
      setError(null);
      if (!otp) {
        throw new Error('OTP not generated. Please try sending it again.');
      }

      // Simulate a delay of 2 seconds using setTimeout
      setLoading(true); // Set loading state to true during the delay
      setTimeout(() => {
        setLoading(false); // Set loading state to false after 2 seconds (simulation of OTP verification)

        if (enteredOTP === otp.toString()) {
          router.push('/textchat'); // Redirect to textchat page if OTP verification succeeds
        } else {
          setError('Invalid OTP. Please enter the correct OTP.');
        }
      }, 2000); // Simulate 2 seconds delay
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Failed to verify OTP. Please try again.'); // Error message for OTP verification failure
      setLoading(false); // Set loading state to false in case of an error
    }
  };

  return (
    <div>
      <div style={{ display: otpSent || accMade ? 'none' : 'block' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: 'black',
        }}>
          <div style={{
            background: 'black',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '100%',
          }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px', color: 'white' }}>Sign Up</h1>
            {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
            <form onSubmit={handleSignUp}>
              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: '15px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
              />
              <input
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginBottom: '15px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
              />
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{ marginBottom: '15px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                style={{ marginBottom: '15px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
              >
                <option value="">Select College</option>
                {colleges.map((collegeOption) => (
                  <option key={collegeOption} value={collegeOption}>
                    {collegeOption}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                style={{
                  backgroundColor: 'green',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px',
                  width: '100%',
                  cursor: 'pointer',

                }}
                disabled={loading}
              >
                {loading ? <CircularProgress style={{ fontSize: '1rem', width: '1rem', height: '1rem' }} /> : 'Send OTP'}
              </button>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <a href="/signin" style={{ color: 'white' }}>Already a user? Login Here</a>
            </div>
          </div>
        </div>
      </div>


      <div style={{ display: otpSent || accMade ? 'block' : 'none' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: 'black',
          color: 'white'
        }}>
          <div style={{
            background: 'black',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '100%',
          }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Verify Email</h1>
            {otpsentagain && <p style={{ color: 'green', fontSize: '0.7rem' }}>OTP sent successfully</p>}
            {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
            {error && <p className={styles.errorMessage}>{error}</p>}
            <form onSubmit={handleVerifyOTP}>
              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: '15px', padding: '10px', width: '100%' }}
              />
              <input
                type="text"
                placeholder="Enter OTP"
                value={enteredOTP}
                required
                onChange={(e) => setEnteredOTP(e.target.value)}
                style={{ marginBottom: '15px', padding: '10px', width: '100%' }}
              />
              <button type='submit' style={{
                backgroundColor: 'blue',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px',
                width: '100%',
                cursor: 'pointer',
                backgroundColor: 'green'
              }}>{loading ? <CircularProgress style={{ fontSize: '1rem', width: '1rem', height: '1rem' }} /> : 'Verify Email'}</button>
              <div className={styles.resendOTP}>
                <button style={{
                  backgroundColor: 'blue',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px',
                  width: '100%',
                  cursor: 'pointer',
                  backgroundColor: 'black',
                  margin: '1rem 0',
                  border: '1px solid white'
                }} onClick={() => sendOTP()}>{loading ? <CircularProgress style={{ fontSize: '1rem', width: '1rem', height: '1rem' }} /> : 'Resend OTP'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Signup;
