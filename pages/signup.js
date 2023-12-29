// pages/signup.js
import { auth } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import React, { useState } from "react";

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [college, setCollege] = useState('');
  const [error, setError] = useState(null);

  const allowedDomains = ['hbtu.ac.in', 'aktu.ac.in', 'gmail.com'];
  const colleges = ['HBTU Kanpur', 'IIT Kanpur']; // Add more colleges as needed

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      setError(null);
      const domain = email.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        throw new Error('Please use a valid college email address.');
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Send user data to API route
      await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, gender, age, college }),
      });
      console.log('success')
      // Redirect to the signin page after successful signup
      // router.push('/signin');
    } catch (error) {
      console.error("Error signing up:", error);
      setError(error.message);
    }
  };

  return (
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
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign Up</h1>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
        <form onSubmit={handleSignUp}>
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: '15px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: '15px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: '15px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ marginBottom: '15px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ marginBottom: '15px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
          />
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
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            Sign Up
          </button>
        </form>
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <a href="/signin" style={{ color: 'white' }}>Already a user? Login Here</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
