import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { signIn } from 'next-auth/react';
import { createTheme, ThemeProvider, Select, MenuItem, TextField, Button, InputLabel, InputAdornment, IconButton } from '@mui/material';
import Image from 'next/image';
import styles from './signup.module.css';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CustomHead from '@/components/seo/CustomHead';
import Link from 'next/link';

const mymtheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(45, 45, 45)',
    },
  },
});

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Select Gender');
  const [college, setCollege] = useState('');
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
        setTestIds(data.map(test => test.email));
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

    // Check if any allowed email domain starts with the entered domain
    const matchedCollege = allowedEmails.find((allowedEmail) => allowedEmail.startsWith(emailDomain));
    if (matchedCollege) {
      const collegeIndex = allowedEmails.indexOf(matchedCollege);
      setCollege('');
      const matchedCollege2 = allowedEmails.find((allowedEmail) => allowedEmail === emailDomain)
      if (matchedCollege2) {
        const collegeIndex2 = allowedEmails.indexOf(matchedCollege2);
        setCollege(colleges[collegeIndex2]);
      }
      setError(null); // Clear error if email is valid
    } else {
      setCollege('');
      if (emailValue.includes('@') && emailValue.includes('.')) {
        setError('Your college is not on mym yet.');
      } else {
        setError(null); // Clear error if email is empty
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      setError(null);
      setLoading(true);
      let isTestId = false;
      if (allowOnlyCollegeEmails) {
        const isEmailAllowed = allowedEmails.some((allowedEmail) =>
          email.endsWith(allowedEmail)
        );
        isTestId = testIds.includes(email); // Check if email is one of the test IDs
        if (!isEmailAllowed && !isTestId) {
          throw new Error('Your college is not on mym yet.');
        }
      }

      if (gender === 'Select Gender' || college === '') {
        throw new Error('Please fill all the fields');
      }

      // Create user with email and password
      const authResult = await createUserWithEmailAndPassword(auth, email, password);
      await signIn('credentials', {
        email,
        password,
        redirect: false, // Remove redirect:true here
      });

      // If createUserWithEmailAndPassword is successful, save user data to the database
      if (authResult && authResult.user) {

        const responseSaving = await fetch('/api/security/saveuseronsignup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, gender, college, isTestId }),
        });

        if (!responseSaving.ok) {
          throw new Error('Failed to save user data.');
        }

        console.log('Successful signup');

        // Redirect to verifyotp page with the entered email
        if (isTestId) {
          router.push(`/`);
        }
        else {
          router.push(`/verify/verifyotp`);
        }
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomHead title={'Signup to MYM - Meet Your Mate'} />

      <ThemeProvider theme={mymtheme}>
        <div className={styles.mainContainer}>
          <div className={styles.macpng}>
            <Image src={'/images/large_pngs/macbook_chat.png'} width={2400} height={1476} alt='preview'></Image>
          </div>
          <div className={styles.mainBox}>
            <Image src={'/images/mym_logos/mymshadow.png'} width={1232} height={656} alt='mym' className={styles.mymLogo}></Image>
            {error && (
              <p style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
                {error} <br />
                {error === 'Your college is not on mym yet.' ? (
                  <Link
                    style={{ color: 'rgb(0,0,0)', textDecoration: 'none', marginTop: '-1rem', }}
                    href={`/give-your-suggestion?category=add-college&collegedomain=${email.split('@')[1]}`}
                  >
                    Click here to get your college added.
                  </Link>
                ) : null}
              </p>
            )}

            <form onSubmit={handleSignUp} className={styles.form}>
              <TextField
                type="email"
                label="College Id"
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
                type={showPassword ? "text" : "password"}
                label="Create Password"
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
              </Select>
              <TextField
                variant='standard'
                required
                value={college}
                label="College"
                placeholder='fill valid college id first'
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
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => router.push('/auth/signin')}
              className={styles.paraLink}
            >
              <span style={{ marginRight: '0.5rem' }}>Already have an account?</span ><span style={{ cursor: 'pointer', color: 'rgb(50, 50, 50)', fontWeight: '800' }}>Login</span>

            </div>
          </div>
        </div>
      </ThemeProvider>
    </>
  );
};

export default Signup;
