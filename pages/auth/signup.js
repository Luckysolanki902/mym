// pages/signup.js
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { signIn } from 'next-auth/react';
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


const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Select Gender');
  const [college, setCollege] = useState('Select College');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [collegesLoaded, setCollegesLoaded] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState([]);

  // admin
  const [allowOnlyCollegeEmails, setAllowOnlyCollegeEmails] = useState(false);
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

  useEffect(() => {
    console.log(colleges)
  }, [colleges])
  // const colleges = ['HBTU Kanpur', 'IIT Kanpur'];

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      setError(null);
      setLoading(true);

      if (allowOnlyCollegeEmails) {
        const isEmailAllowed = allowedEmails.some((allowedEmail) =>
          email.endsWith(allowedEmail)
        );
        if (!isEmailAllowed) {
          throw new Error('Your email is not allowed to register');
        }
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
    <ThemeProvider theme={mymtheme}>
      <div className={styles.mainContainer}>
        <div className={styles.macpng}>
          <Image src={'/images/large_pngs/macbook_chat.png'} width={2400} height={1476} alt='preview'></Image>
        </div>
        <div className={styles.mainBox}>
          <Image src={'/images/mym_logos/mymshadow.png'} width={1232} height={656} alt='mym' className={styles.mymLogo}></Image>
          {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
          <form onSubmit={handleSignUp} className={styles.form}>
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
            <Select
              disabled={!collegesLoaded}
              variant='standard'
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              label="Select College"
              inputProps={{
                name: 'college',
                id: 'college-select',
              }}
              className={`${styles.selectInput} ${college === 'Select College' ? `${styles.placeholder}` : ''}`}

            >
              <MenuItem value="Select College">Select College</MenuItem>
              {colleges.map((collegeOption) => (
                <MenuItem key={collegeOption} value={collegeOption}>
                  {collegeOption}
                </MenuItem>
              ))}
            </Select>
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
          <a href="/auth/signin" className={styles.paraLink}>
            Already have an account?
          </a>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => router.push('/auth/signin')}
            className={`${styles.button} ${styles.button2}`}
          >
            {'Sign In Instead'}
          </Button>
        </div>
      </div>
    </ThemeProvider>

  );
};

export default Signup;