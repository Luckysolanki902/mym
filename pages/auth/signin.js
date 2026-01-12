import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createTheme, ThemeProvider, TextField, Button, InputAdornment, IconButton } from '@mui/material';
import styles from './signup.module.css'
import CircularProgress from '@mui/material/CircularProgress';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CustomHead from "@/components/seo/CustomHead";
import { useSession } from 'next-auth/react';
import { getSession } from "next-auth/react";
import PhoneMockup from '@/components/commonComps/PhoneMockup';



const spylltheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(45, 45, 45)',
    },
  },
});



export default function Signin({userDetails}) {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(()=>{
    if(userDetails){
      router.push('/')
    }
  }, [userDetails])
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState(null); // State to manage sign-in errors
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      <CustomHead title={'Login to Spyll - Your Campus Confidential'} />
      <ThemeProvider theme={spylltheme}>

        <div className={styles.mainContainer}>
          <div className={styles.mockupSection}>
            <PhoneMockup
              mode="auto"
              variant="signup"
              showToggle={false}
              autoRotate={true}
              rotateInterval={4000}
              tilt="left"
            />
          </div>
          <div className={styles.mainBox}>
            <div className={styles.spyllLogo}>spyll</div>
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
                type={showPassword ? "text" : "password"}
                label="Password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{
                  required: false, // Remove the asterisk for the Email field
                }}
                className={styles.input}

                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={styles.button}
                style={{ textTransform: 'none' }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
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
              style={{ textTransform: 'none' }}
            >
              <span style={{ marginRight: '0.5rem' }}>Don't have an account?</span ><span style={{ cursor: 'pointer', color: 'rgb(50, 50, 50)', fontWeight: '800' }}>Signup</span>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </>

  );
}

export async function getServerSideProps(context) {
  let session = null;
  session = await getSession(context);

  let userDetails = null;
  if (session?.user?.email) {
    try {
      const pageurl = process.env.NEXT_PUBLIC_PAGEURL;
      const response = await fetch(`${pageurl}/api/getdetails/getuserdetails?userEmail=${session.user.email}`);
      if (response.ok) {
        userDetails = await response.json();
      } else {
        console.error('Error fetching user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }

  return {
    props: {
      userDetails,
    },
  };
}