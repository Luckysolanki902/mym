import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Link from "next/link";

export default function Signin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState(null); // State to manage sign-in errors

  const handleSignIn = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    try {
      setSignInError(null); // Clear any previous sign-in errors
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Remove redirect:true here
      });

      // Check if the signIn attempt was successful before redirection
      if (result.error) {
        if (result.error === 'CredentialsSignin' && result.status === 401) {
          throw new Error("Invalid credentials. Please check your your credentials.");
        } else if (result.error === 'CredentialsSignin' && result.status === 404) {
          throw new Error("This email address doesn't exist. Please register.");
        } else {
          throw new Error("An error occurred during sign-in. Please try again.");
        }
      }

      // Redirect the user after successful authentication
      router.push('/dashboard'); // Replace '/' with the desired redirect path
    } catch (error) {
      console.error("Error signing in:", error);
      setSignInError(error.message); // Set the sign-in error message
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <h1>Sign In</h1>
        {signInError && (
          <p style={{ color: 'red' }}>{signInError}</p>
        )}
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column' }}>
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              margin: '10px',
              padding: '8px',
              width: '300px',
            }}
          />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              margin: '10px',
              padding: '8px',
              width: '300px',
            }}
          />
          <button
            type="submit"
            style={{
              margin: '10px',
              padding: '8px 16px',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            disabled={!email || !password}
          >
            Sign In
          </button>
        </form>
        <div><Link href="/auth/signup">Not a user? Register Here</Link></div>
        <div><Link href="/auth/forgot-password">Forgot Password</Link></div>
      </div>
    </div>
  );
}
