// components/chatComps/UserVerificationDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Box,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Paper,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getSession } from 'next-auth/react'; // Updated import
import { useDispatch, useSelector } from 'react-redux';
import {
  setUnverifiedUserDetails,
  setLastDialogShownAt,
} from '@/store/slices/unverifiedUserDetailsSlice';
import { useRouter } from 'next/router';
import axios from 'axios';

const steps = ['Guidelines', 'Sign In or Not', 'Gender & College'];

const UserVerificationDialog = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Classify user:
  //   "signedIn" -> session truthy
  //   "unverifiedHasDetails" -> no session, but unverifiedUserDetails.mid
  //   "unverifiedNoDetails" -> no session, and no unverifiedUserDetails.mid
  const [userType, setUserType] = useState(null);

  // Session state
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // For Step 2 form data
  const [colleges, setColleges] = useState([]);
  const [gender, setGender] = useState('');
  const [college, setCollege] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [showButtonLoading, setShowButtonLoading] = useState(false)

  // --- Title-case utility ---
  const toTitleCase = (str) =>
    str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });

  // -------------------------
  // 1. Fetch session manually
  // -------------------------
  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
      setLoading(false);
    };

    fetchSession();
  }, []);

  // -------------------------
  // 2. Determine userType (sync once on load or changes)
  // -------------------------
  useEffect(() => {
    if (loading) return; // Wait until session is fetched

    let timeoutId;
    const decideUserType = () => {
      if (session && session.user && session.user.email) {
        setUserType('signedIn');
      } else if (unverifiedUserDetails?.mid) {
        setUserType('unverifiedHasDetails');
      } else {
        setUserType('unverifiedNoDetails');
      }
    };

    timeoutId = setTimeout(decideUserType, 1000);
    return () => clearTimeout(timeoutId);
  }, [session, unverifiedUserDetails.mid, loading]);

  // -------------------------
  // 3. Decide if we should show dialog based on userType + time checks
  // -------------------------
  useEffect(() => {
    const hasStartedChatting = localStorage.getItem('hasStartedChatting');
    if (hasStartedChatting === 'true') {
      setOpen(false); // Ensure dialog stays closed if already started chatting
      return;
    }

    if (!userType) return; // Wait until we know userType

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (userType === 'signedIn') {
      const lastShown = localStorage.getItem('lastDialogShownAtSignedIn');
      if (!lastShown || now - parseInt(lastShown, 10) > oneHour) {
        setOpen(true);
      }
    } else if (userType === 'unverifiedHasDetails') {
      const lastShown = unverifiedUserDetails.lastDialogShownAt;
      if (!lastShown || now - lastShown > oneHour) {
        setOpen(true);
      }
    } else if (userType === 'unverifiedNoDetails') {
      setOpen(true);
    }
  }, [userType, unverifiedUserDetails.lastDialogShownAt]);


  // -------------------------
  // 4. Fetch colleges once
  // -------------------------
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get('/api/admin/getdetails/getcolleges');
        setColleges(response.data);
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };
    fetchColleges();
  }, []);

  // -------------------------
  // Dialog Handlers
  // -------------------------
  const handleClose = () => {
    setOpen(false);
    const now = new Date().getTime();

    if (userType === 'signedIn') {
      localStorage.setItem('lastDialogShownAtSignedIn', now.toString());
    } else {
      // unverifiedHasDetails or unverifiedNoDetails
      dispatch(setLastDialogShownAt(now));
    }
  };

  // Next button on each step
  const handleNext = () => {
    if (activeStep === 0) {
      // Step 0 -> Step 1 if unverified
      // If signed in, close immediately
      if (userType === 'signedIn') {
        handleClose();
      } else {
        setActiveStep(1);
      }
    } else if (activeStep === 1) {
      // Step 1 -> Step 2
      setActiveStep(2);
    }
  };

  // Back button
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleContinueWithoutSignIn = () => {
    setActiveStep(2);
  };

  // Final step: store details to Redux
  const handleStartChatting = () => {
    if (!gender || !college) {
      alert('Please select both gender and college.');
      return;
    }

    let finalCollegeName = college;
    if (college === 'other') {
      if (!collegeName.trim()) {
        alert('Please provide a college name.');
        return;
      }
      finalCollegeName = toTitleCase(collegeName.trim());
    }

    // Save details
    dispatch(
      setUnverifiedUserDetails({
        gender,
        college: finalCollegeName,
      })
    );

    // Set loading state
    setShowButtonLoading(true);

    // Use a flag to avoid reopening
    localStorage.setItem('hasStartedChatting', 'true');

    // Close dialog after loading finishes
    setTimeout(() => {
      setShowButtonLoading(false);
      setOpen(false); // Close dialog definitively
    }, 1000);
  };




  // -------------------------
  // Step-by-step UI
  // -------------------------
  const renderStepContent = () => {
    // Step 0: Verified vs Unverified info
    if (activeStep === 0) {
      return (
        <Box>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <WarningIcon color="warning" fontSize="large" />
            </Grid>
            <Grid item>
              <Typography variant="h6" fontWeight="bold">
                Unverified User
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Unverified Users are those who are chatting without signing in.
            They have not confirmed their college and might not be so trustworthy.
          </Typography>

          <Grid container alignItems="center" spacing={2} sx={{ mt: 3 }}>
            <Grid item>
              <CheckCircleIcon color="success" fontSize="large" />
            </Grid>
            <Grid item>
              <Typography variant="h6" fontWeight="bold">
                Verified User
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Verified users have signed in and confirmed their college with otp.
            You can trust that they are honest about their college. Sign in to make others trust you.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          
            <Button
              variant="outlined"
              onClick={()=> router.push('/')}
            >
              Back to Home
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                backgroundColor: '#2d2d2d',
                ':hover': { backgroundColor: 'rgba(45, 45, 45, 0.9)' },
              }}
            >
              {userType !== 'unverifiedNoDetails' ? 'Okay' : 'Next'}
            </Button>
          </Box>
        </Box>
      );
    }

    // Step 1: Sign In or Continue
    if (activeStep === 1) {
      return (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body1" sx={{ ml: 1, fontWeight:'600', fontSize:"1.1rem" }}>
              Sign In or Continue
            </Typography>
          </Box>

          <Typography variant="body2" gutterBottom>
            You can sign in (or create an account) to become a verified user,
            or continue as an unverified user.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 3,
              flexDirection: {
                xs: 'column', // column direction for small screens
                sm: 'row', // row direction for medium and larger screens
              },
              gap:'1rem',
            }}

          >
            <Button
              variant="contained"
              onClick={handleSignIn}
              sx={{
                backgroundColor: 'black',
                color: 'white',
                ':hover': {
                  backgroundColor: '#333',
                  fontsize: '0.7rem',
                },
              }}
            >
              Sign In
            </Button>

            <Button
              variant="outlined"
              onClick={handleContinueWithoutSignIn}
              sx={{
                color: 'black',
                borderColor: 'black',
                ':hover': {
                  borderColor: '#666',
                  color: '#444',
                  fontsize: '0.7rem',
                },
              }}
            >
              Continue without Signing In
            </Button>
          </Box>
        </Box>
      );
    }

    // Step 2: Enter Details
    if (activeStep === 2) {
      return (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2 }}>
              Enter Your Details
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              value={gender}
              label="Gender"
              onChange={(e) => setGender(e.target.value)}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel id="college-label">College</InputLabel>
            <Select
              labelId="college-label"
              value={college}
              label="College"
              onChange={(e) => {
                setCollege(e.target.value);
                if (e.target.value !== 'other') {
                  setCollegeName('');
                }
              }}
            >
              {colleges.map((col) => (
                <MenuItem key={col._id} value={col.college}>
                  {col.college}
                </MenuItem>
              ))}
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          {college === 'other' && (
            <TextField
              fullWidth
              label="College Name"
              placeholder="Enter your college name"
              variant="outlined"
              sx={{ mt: 3 }}
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleStartChatting}
              disabled={showButtonLoading} // Disable button while loading
              sx={{
                backgroundColor: showButtonLoading ? '#ccc' : '#2d2d2d',
                ':hover': { backgroundColor: showButtonLoading ? '#ccc' : 'rgba(45,45,45,0.9)' },
              }}
            >
              {showButtonLoading ? 'Working...' : 'Start Chatting!'}
            </Button>
          </Box>

        </Box>
      );
    }

    return null;
  };

  // Optional: Render nothing or a loader while loading
  if (loading) {
    return null; // Or a loader component like <CircularProgress />
  }

  return (
    <Dialog
      open={open}
      onClose={() => { }}
      disableEscapeKeyDown
      aria-labelledby="user-verification-dialog"
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 4,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 2,
            '& .MuiStepIcon-root.Mui-active': { color: '#2d2d2d' },
            '& .MuiStepIcon-root.Mui-completed': { color: '#4caf50' },
          }}
        >
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#fdfdfd',
          }}
        >
          {renderStepContent()}
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default UserVerificationDialog;
