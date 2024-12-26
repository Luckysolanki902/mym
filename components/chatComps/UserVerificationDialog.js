// components/UserVerificationDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  IconButton,
  Slide,
  Stepper,
  Step,
  StepLabel,
  Box,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { setUnverifiedUserDetails, setLastDialogShownAt } from '@/store/slices/unverifiedUserDetailsSlice';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const steps = ['Verification', 'Sign In', 'Details'];

const UserVerificationDialog = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [colleges, setColleges] = useState([]);
  const [gender, setGender] = useState('');
  const [college, setCollege] = useState('');

  // Fetch colleges on component mount
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

  // Determine whether to show the dialog
  useEffect(() => {
    const shouldShowDialog = () => {
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;

      if (session) {
        // If signed in, check last dialog shown time from API or other method if needed
        // For simplicity, using localStorage
        const lastShown = localStorage.getItem('lastDialogShownAtSignedIn');
        if (!lastShown || now - parseInt(lastShown) > oneHour) {
          return true;
        }
        return false;
      } else {
        // If not signed in, check from Redux
        if (!unverifiedUserDetails.mid) {
          return true;
        }
        const lastShown = unverifiedUserDetails.lastDialogShownAt;
        if (!lastShown || now - lastShown > oneHour) {
          return true;
        }
        return false;
      }
    };

    if (shouldShowDialog()) {
      setOpen(true);
    }
  }, [session, unverifiedUserDetails]);

  const handleClose = () => {
    setOpen(false);
    const now = new Date().getTime();
    if (session) {
      localStorage.setItem('lastDialogShownAtSignedIn', now.toString());
    } else {
      dispatch(setLastDialogShownAt(now));
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (session) {
        handleClose();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    } else if (activeStep === 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleContinueWithoutSignIn = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleStartChatting = () => {
    if (gender && college) {
      dispatch(setUnverifiedUserDetails({ gender, college }));
      handleClose();
    } else {
      alert('Please select both gender and college.');
    }
  };

  const renderStepContent = () => {
    if (activeStep === 0) {
      return (
        <Box>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <WarningIcon color="warning" fontSize="large" />
            </Grid>
            <Grid item>
              <Typography variant="h6">Unverified User</Typography>
            </Grid>
          </Grid>
          <Grid container alignItems="center" spacing={2} sx={{ mt: 2 }}>
            <Grid item>
              <CheckCircleIcon color="success" fontSize="large" />
            </Grid>
            <Grid item>
              <Typography variant="h6">Verified User</Typography>
            </Grid>
          </Grid>
          <Typography sx={{ mt: 2 }}>
            Verified users have full access to all features, including personalized settings and secure data. Unverified users can still enjoy chatting anonymously but with limited features.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" onClick={handleNext}>
              {session ? 'Okay' : 'Next'}
            </Button>
          </Box>
        </Box>
      );
    } else if (activeStep === 1) {
      return (
        <Box>
          <IconButton onClick={handleBack} sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Continue as Unverified User
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="contained"
              color="inherit"
              onClick={handleSignIn}
              sx={{ backgroundColor: 'black', color: 'white' }}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              onClick={handleContinueWithoutSignIn}
              sx={{ color: 'black', borderColor: 'black' }}
            >
              Continue without Sign In
            </Button>
          </Box>
        </Box>
      );
    } else if (activeStep === 2) {
      return (
        <Box>
          <IconButton onClick={handleBack} sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Enter Your Details
          </Typography>
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
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="college-label">College</InputLabel>
            <Select
              labelId="college-label"
              value={college}
              label="College"
              onChange={(e) => setCollege(e.target.value)}
            >
              {colleges.map((col) => (
                <MenuItem key={col._id} value={col.college}>
                  {col.college}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" onClick={handleStartChatting}>
              Start Chatting!
            </Button>
          </Box>
        </Box>
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      disableEscapeKeyDown
      aria-labelledby="user-verification-dialog"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>
      <DialogContent>{renderStepContent()}</DialogContent>
    </Dialog>
  );
};

export default UserVerificationDialog;
