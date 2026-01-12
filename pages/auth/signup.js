// pages/auth/signup.js
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { setSignupData, setOtpToken, setOtpSentAt, clearSignupData } from '@/store/slices/signupSlice';
import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider, Select, MenuItem, TextField, Button, InputAdornment, IconButton, Alert } from '@mui/material';
import styles from './signup.module.css';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CustomHead from '@/components/seo/CustomHead';
import Link from 'next/link';
import { getSession } from 'next-auth/react';
import PhoneMockup from '@/components/commonComps/PhoneMockup';
import SpyllWordmark from '@/components/commonComps/SpyllWordmark';

const spylltheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(45, 45, 45)',
    },
  },
});

const Signup = ({ userDetails }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const signupData = useSelector((state) => state.signup);

  useEffect(() => {
    if (userDetails) {
      router.push('/');
    }
  }, [userDetails, router]);

  const [email, setEmail] = useState(signupData.email || '');
  const [password, setPassword] = useState(signupData.password || '');
  const [gender, setGender] = useState(signupData.gender || 'Select Gender');
  const [college, setCollege] = useState(signupData.college || '');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [collegesLoaded, setCollegesLoaded] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [testIds, setTestIds] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  // admin
  const allowOnlyCollegeEmails = true;

  useEffect(() => {
    // Fetch test IDs
    const fetchTestIds = async () => {
      try {
        const response = await fetch('/api/admin/testids/get');
        const data = await response.json();
        setTestIds(data.map((test) => test.email));
      } catch (error) {
        console.error('Error fetching test IDs:', error);
      }
    };

    fetchTestIds();
  }, []);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('/api/admin/getdetails/getcolleges');
        const data = await response.json();

        if (response.ok) {
          const mappedColleges = data.map((collegeData) => collegeData.college);
          const mappedEmails = data.map((collegeData) => collegeData.emailendswith);
          setColleges(mappedColleges);
          setAllowedEmails(mappedEmails);
        } else {
          throw new Error('Failed to fetch colleges');
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
      } finally {
        setCollegesLoaded(true);
      }
    };

    fetchColleges();
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    const emailDomain = emailValue.split('@')[1] || '';

    // Check if it's a test ID first
    if (testIds.includes(emailValue)) {
      setCollege('Test Account');
      setError(null);
      return;
    }

    // Check if any allowed email domain starts with the entered domain
    const matchedCollege = allowedEmails.find((allowedEmail) => allowedEmail.startsWith(emailDomain));
    if (matchedCollege) {
      const collegeIndex = allowedEmails.indexOf(matchedCollege);
      setCollege('');
      const matchedCollege2 = allowedEmails.find((allowedEmail) => allowedEmail === emailDomain);
      if (matchedCollege2) {
        const collegeIndex2 = allowedEmails.indexOf(matchedCollege2);
        setCollege(colleges[collegeIndex2]);
      }
      setError(null); // Clear error if email is valid
    } else {
      setCollege('');
      if (emailValue.includes('@') && emailValue.includes('.')) {
        setError('Your college is not on Spyll yet.');
      } else {
        setError(null); // Clear error if email is empty
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      setError(null);

      // Validation
      if (gender === 'Select Gender') {
        throw new Error('Please select your gender.');
      }

      if (college === '') {
        throw new Error('Please fill all fields.');
      }

      if (allowOnlyCollegeEmails) {
        const isEmailAllowed = allowedEmails.some((allowedEmail) =>
          email.endsWith(allowedEmail)
        );
        const isTestId = testIds.includes(email); // Check if email is one of the test IDs
        if (!isEmailAllowed && !isTestId) {
          throw new Error('Your college is not on Spyll yet.');
        }
      }

      setLoading(true);

      // Send OTP to the email
      const response = await fetch('/api/security/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      // Save signup data and OTP token to Redux
      dispatch(
        setSignupData({
          email,
          password,
          gender,
          college,
          isTestId: testIds.includes(email),
        })
      );

      dispatch(setOtpToken(data.token));
      dispatch(setOtpSentAt(new Date().toISOString()));

      // Redirect to verify OTP page
      router.push('/verify/verifyotp');
    } catch (error) {
      console.error('Error during signup:', error);
      setError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomHead title={'Signup to Spyll - Your Campus Confidential'} />

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
            <SpyllWordmark className={styles.spyllLogo} />
            {error && (
              <Alert severity="error" style={{ marginBottom: '15px' }}>
                {error}{' '}
                {error === 'Your college is not on Spyll yet.' && (
                  <Link
                    style={{ color: 'rgb(0,0,0)', textDecoration: 'none', marginTop: '-1rem' }}
                    href={`/give-your-suggestion?category=add-college&collegedomain=${email.split('@')[1]}`}
                  >
                    Click here to get your college added.
                  </Link>
                )}
              </Alert>
            )}

            <form onSubmit={handleSignUp} className={styles.form}>
              <TextField
                type="email"
                label="College Email"
                autoComplete="email"
                required
                value={email}
                onChange={handleEmailChange}
                variant='standard'
                InputLabelProps={{
                  required: false, // Remove the asterisk for the Email field
                }}
                className={styles.input}
              />
              <TextField
                variant='standard'
                type={showPassword ? 'text' : 'password'}
                label="Create Password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{
                  required: false, // Remove the asterisk for the Password field
                }}
                className={styles.input}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Select
                variant='standard'
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                label="Select Gender"
                inputProps={{
                  name: 'gender',
                  id: 'gender-select',
                }}
                className={`${styles.selectInput} ${gender === 'Select Gender' ? `${styles.placeholder}` : ''}`}
              >
                <MenuItem value="Select Gender">Select Gender</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                {/* <MenuItem value="other">Other</MenuItem> */}
              </Select>
              {gender !== 'Select Gender' && (
                <p className={styles.genderWarning}>
                  You won&apos;t be able to change this field later
                </p>
              )}
              <TextField
                variant='standard'
                required
                value={college}
                label="College"
                placeholder='Fill a valid college email first'
                inputProps={{
                  readOnly: true,
                }}
                className={styles.input}
              />
              <Button
                disabled={!collegesLoaded || loading}
                type="submit"
                variant="contained"
                color="primary"
                className={styles.button}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
              </Button>
            </form>
            <div className={styles.line}></div>
            <div
              onClick={() => router.push('/auth/signin')}
              className={styles.paraLink}
              style={{ cursor: 'pointer' }}
            >
              <span style={{ marginRight: '0.5rem' }}>Already have an account?</span>
              <span style={{ color: 'rgb(50, 50, 50)', fontWeight: '800' }}>Login</span>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </>
  );
};

export default Signup;

export async function getServerSideProps(context) {
  // Retrieve the current session based on the request
  const session = await getSession(context);

  if (session?.user?.email) {
    try {
      const pageurl = process.env.NEXT_PUBLIC_PAGEURL;
      const response = await fetch(`${pageurl}/api/getdetails/getuserdetails?userEmail=${session.user.email}`);
      
      if (response.ok) {
        const userDetails = await response.json();
        
        if (userDetails) {
          return {
            redirect: {
              destination: '/',
              permanent: false, 
            },
          };
        }
      } else {
        console.error('Error fetching user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }

  return {
    props: {},
  };
}
