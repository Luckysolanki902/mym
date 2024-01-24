// pages/signup.js
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useSession } from 'next-auth/react';
import { signIn } from "next-auth/react";


const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [college, setCollege] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);


  const colleges = ['HBTU Kanpur', 'IIT Kanpur'];

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      setError(null);
      setLoading(true);

      // Create user with email and password
      const authResult = await createUserWithEmailAndPassword(auth, email, password,);
      await signIn('credentials', {
        email,
        password,
        redirect: false, // Remove redirect:true here
      });

      // If createUserWithEmailAndPassword is successful, save user data to the database
      if (authResult && authResult.user ) {
        const responseSaving = await fetch('/api/security/saveuseronsignup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, gender, college }),
        });

        if (!responseSaving.ok) {
          throw new Error('Failed to save user data.');
        }

        console.log('Successful signup and user data saved');

        // Now that the user is saved, send OTP
        const responseSendingOTP = await fetch('/api/security/sendotp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!responseSendingOTP.ok) {
          throw new Error('Failed to send OTP.');
        }

        console.log('OTP sent successfully');

        // Redirect to verifyotp page with the entered email
        router.push(`/verify/verifyotp`);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'block' }}>
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
                {loading ? <CircularProgress style={{ fontSize: '1rem', width: '1rem', height: '1rem' }} /> : 'Sign Up'}
              </button>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <a href="/auth/signin" style={{ color: 'white' }}>Already a user? Login Here</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
