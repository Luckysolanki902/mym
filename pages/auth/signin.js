import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Link from "next/link";
import { createTheme, ThemeProvider, TextField, Button } from '@mui/material';
import Image from 'next/image';
import styles from './signup.module.css'
import CircularProgress from '@mui/material/CircularProgress';





const mymtheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(45, 45, 45)',
    },
  },
});



export default function Signin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState(null); // State to manage sign-in errors
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      setSignInError(null); // Clear any previous sign-in errors
      setLoading(true);

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
      router.push('/'); // Replace '/' with the desired redirect path
    } catch (error) {
      console.error("Error signing in:", error);
      setSignInError(error.message); // Set the sign-in error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={mymtheme}>

      <div className={styles.mainContainer}>
        <div className={styles.macpng}>
          <Image src={'/images/large_pngs/macbook_chat.png'} width={2400} height={1476} alt='preview'></Image>
        </div>
        <div className={styles.mainBox}>
          <Image src={'/images/mym_logos/mymshadow.png'} width={1232} height={656} alt='mym' className={styles.mymLogo}></Image>
          {signInError && (<p style={{ color: 'red' }}>{signInError}</p>)}
          <form onSubmit={handleSignIn} className={styles.form}>
            <TextField
              type="email"
              label="College Id"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant='standard'
              InputLabelProps={{
                required: false, // Remove the asterisk for the Email field
              }}
              className={styles.input}
            />
            <TextField
              variant='standard'
              type="password"
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{
                required: false, // Remove the asterisk for the Email field
              }}
              className={styles.input}

            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={styles.button}
              style={{ textTransform: 'none' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>
          <Link href="/auth/forgot-password" className={styles.paraLink2}>
            Forgot Password?
          </Link>
          <div className={styles.line}></div>
          <div
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => router.push('/auth/signup')}
            className={styles.paraLink}
            style={{ textTransform: 'none', cursor: 'pointer' }}

          >
            {'Create New Account'}
          </div>
        </div>
      </div>
    </ThemeProvider>

  );
}
