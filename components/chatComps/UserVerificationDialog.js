// components/chatComps/UserVerificationDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  TextField,
  Chip,
  Stack,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { getSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { setUnverifiedUserDetails } from '@/store/slices/unverifiedUserDetailsSlice';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import SearchableCollegeSelect from '@/components/commonComps/SearchableCollegeSelect';

// --- Styled Components for Glassmorphism ---
const GlassDialogContent = styled(DialogContent)({
  padding: '2.5rem',
  background: 'rgba(255, 255, 255, 0.75)',
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  borderRadius: '1.8rem',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 12px 48px -12px rgba(31, 38, 135, 0.15)',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '300%',
    height: '300%',
    background: 'radial-gradient(circle, rgba(255, 118, 159, 0.15) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%) scale(0)',
    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease',
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0,
  },
  '&.male-selected::before': {
    background: 'radial-gradient(circle, rgba(79, 195, 247, 0.15) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: 1,
  },
  '&.female-selected::before': {
    background: 'radial-gradient(circle, rgba(255, 118, 159, 0.15) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: 1,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
});

const StyledButton = styled(Button)(({ variant, gender }) => ({
  borderRadius: '1.5rem',
  padding: '0.8rem 2rem',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  fontFamily: 'Quicksand, sans-serif',
  border: variant === 'contained' ? '1px solid rgba(255, 255, 255, 0.6)' : '1px solid #b2bec3',
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: variant === 'contained' 
    ? (gender === 'male' ? '0 8px 32px -8px rgba(79, 195, 247, 0.35), 0 4px 16px -4px rgba(131, 231, 253, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
      : gender === 'female' ? '0 8px 32px -8px rgba(236, 64, 122, 0.35), 0 4px 16px -4px rgba(255, 118, 159, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
      : '0 8px 32px -8px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)')
    : 'none',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  background: gender === 'male' 
    ? 'linear-gradient(135deg, rgba(131, 231, 253, 0.8) 0%, rgba(79, 195, 247, 0.75) 100%)'
    : gender === 'female'
      ? 'linear-gradient(135deg, rgba(255, 118, 159, 0.8) 0%, rgba(236, 64, 122, 0.75) 100%)'
      : variant === 'contained' ? 'linear-gradient(135deg, rgba(100, 100, 100, 0.85) 0%, rgba(70, 70, 70, 0.8) 100%)' : 'transparent',
  color: variant === 'contained' ? '#fff' : '#636e72',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: variant === 'contained' ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)' : 'none',
  },
  ':hover': {
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: variant === 'contained' 
      ? (gender === 'male' ? '0 12px 40px -8px rgba(79, 195, 247, 0.45), 0 6px 20px -4px rgba(131, 231, 253, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)' 
        : gender === 'female' ? '0 12px 40px -8px rgba(236, 64, 122, 0.45), 0 6px 20px -4px rgba(255, 118, 159, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)' 
        : '0 12px 40px -8px rgba(31, 38, 135, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)')
      : 'none',
    background: gender === 'male' 
      ? 'linear-gradient(135deg, rgba(131, 231, 253, 0.9) 0%, rgba(79, 195, 247, 0.85) 100%)'
      : gender === 'female'
        ? 'linear-gradient(135deg, rgba(255, 118, 159, 0.9) 0%, rgba(236, 64, 122, 0.85) 100%)'
        : variant === 'contained' ? 'linear-gradient(135deg, rgba(80, 80, 80, 0.9) 0%, rgba(50, 50, 50, 0.85) 100%)' : 'rgba(0,0,0,0.05)',
  },
  ':active': {
    transform: 'translateY(-1px) scale(0.98)',
  },
}));

const StyledChip = styled(Chip)(({ selected, gender }) => ({
  borderRadius: '1.2rem',
  padding: '0.6rem 0.8rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  fontFamily: 'Quicksand, sans-serif',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: selected ? 'blur(25px) saturate(150%)' : 'blur(15px)',
  WebkitBackdropFilter: selected ? 'blur(25px) saturate(150%)' : 'blur(15px)',
  backgroundColor: selected 
    ? (gender === 'male' ? 'rgba(79, 195, 247, 0.25)' : 'rgba(236, 64, 122, 0.25)') 
    : 'rgba(250, 250, 252, 0.6)',
  color: selected 
    ? (gender === 'male' ? 'rgba(1, 87, 155, 1)' : 'rgba(194, 24, 91, 1)')
    : 'rgba(99, 110, 114, 0.8)',
  border: selected 
    ? (gender === 'male' ? '1px solid rgba(177, 225, 245, 0.6)' : '1px solid rgba(255, 182, 210, 0.6)')
    : '1px solid rgba(255, 255, 255, 0.4)',
  boxShadow: selected
    ? (gender === 'male' ? '0 4px 16px -4px rgba(79, 195, 247, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)' 
      : '0 4px 16px -4px rgba(236, 64, 122, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)')
    : '0 2px 8px -2px rgba(31, 38, 135, 0.08)',
  '&:hover': {
    transform: 'scale(1.05)',
    backgroundColor: selected 
      ? (gender === 'male' ? 'rgba(79, 195, 247, 0.35)' : 'rgba(236, 64, 122, 0.35)') 
      : 'rgba(250, 250, 252, 0.8)',
    boxShadow: selected
      ? (gender === 'male' ? '0 6px 20px -4px rgba(79, 195, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)' 
        : '0 6px 20px -4px rgba(236, 64, 122, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)')
      : '0 4px 12px -2px rgba(31, 38, 135, 0.12)',
  },
}));

const UserVerificationDialog = ({ mode = 'textchat' }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('choice'); // 'choice' | 'form'

  // User State
  const [userType, setUserType] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State - pre-fill from persisted Redux state
  const [gender, setGender] = useState(unverifiedUserDetails?.gender || '');
  const [college, setCollege] = useState(unverifiedUserDetails?.college || '');
  const [collegeName, setCollegeName] = useState('');
  const [colleges, setColleges] = useState([]);
  const [showButtonLoading, setShowButtonLoading] = useState(false);

  // 1. Fetch Session
  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
      setLoading(false);
    };
    fetchSession();
  }, []);

  // 2. Determine User Type
  useEffect(() => {
    if (loading) return;
    const decideUserType = () => {
      if (session?.user?.email) {
        setUserType('signedIn');
      } else if (unverifiedUserDetails?.mid) {
        setUserType('unverifiedHasDetails');
      } else {
        setUserType('unverifiedNoDetails');
      }
    };
    decideUserType();
  }, [session, unverifiedUserDetails.mid, loading]);

  // Fetch Colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('/api/admin/getdetails/getcolleges');
        if (response.ok) {
          const data = await response.json();
          setColleges(data);
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };
    fetchColleges();
  }, []);

  // Sync form state with persisted Redux state
  useEffect(() => {
    if (unverifiedUserDetails?.gender) {
      setGender(unverifiedUserDetails.gender);
    }
    if (unverifiedUserDetails?.college) {
      setCollege(unverifiedUserDetails.college);
    }
  }, [unverifiedUserDetails?.gender, unverifiedUserDetails?.college]);

  // 3. Open Logic - simply check if user has mid in persisted Redux state
  useEffect(() => {
    if (!userType) return;

    const checkAndOpen = () => {
      if (userType === 'signedIn') {
        // Signed in users are already verified
        return;
      } else if (userType === 'unverifiedHasDetails') {
        // User already has details in persisted Redux - no need to show dialog
        return;
      } else if (userType === 'unverifiedNoDetails') {
        // First time guest - show dialog
        setOpen(true);
      }
    };

    const timer = setTimeout(checkAndOpen, 100);
    return () => clearTimeout(timer);
  }, [userType]);

  // Close redirects to home
  const handleClose = () => {
    router.push('/');
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleContinueGuest = () => {
    setView('form');
  };

  const handleStart = () => {
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
      finalCollegeName = collegeName.trim();
    }

    setShowButtonLoading(true);
    
    dispatch(setUnverifiedUserDetails({
      gender,
      college: finalCollegeName
    }));

    setTimeout(() => {
      setShowButtonLoading(false);
      setOpen(false);
    }, 800);
  };

  if (loading) return null;

  return (
    <Dialog
      open={open}
      onClose={() => {}} // Prevent backdrop click from closing
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        style: {
          borderRadius: '1.5rem',
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible'
        },
      }}
    >
      <GlassDialogContent className={gender === 'male' ? 'male-selected' : gender === 'female' ? 'female-selected' : ''}>
        <a
          href="/"
          style={{
            position: 'absolute',
            right: 16,
            top: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            color: '#636e72',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#2d3436';
            e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#636e72';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <CloseIcon />
        </a>

        {view === 'choice' ? (
          <Fade in={view === 'choice'}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700, mb: 2, color: '#2d3436' }}>
                Verification
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'Quicksand, sans-serif', color: '#636e72', mb: 4, lineHeight: 1.6 }}>
                Join our community of verified students for the best experience. 
                Verified users are more trusted and get better matches.
              </Typography>

              <Stack spacing={2} direction="column" alignItems="center">
                <StyledButton
                  variant="contained"
                  fullWidth
                  onClick={handleSignIn}
                  startIcon={<LoginIcon />}
                  sx={{ 
                    maxWidth: '300px'
                  }}
                >
                  Sign In (Recommended)
                </StyledButton>
                
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '300px', py: 1 }}>
                  <div style={{ flex: 1, height: '1px', background: '#dfe6e9' }}></div>
                  <Typography variant="caption" sx={{ px: 2, color: '#b2bec3' }}>OR</Typography>
                  <div style={{ flex: 1, height: '1px', background: '#dfe6e9' }}></div>
                </Box>

                <StyledButton
                  variant="outlined"
                  fullWidth
                  onClick={handleContinueGuest}
                  startIcon={<PersonOutlineIcon />}
                  sx={{ 
                    borderColor: '#b2bec3',
                    color: '#636e72',
                    maxWidth: '300px',
                    '&:hover': { borderColor: '#636e72', background: 'rgba(0,0,0,0.02)' }
                  }}
                >
                  Continue as Guest
                </StyledButton>
              </Stack>
            </Box>
          </Fade>
        ) : (
          <Fade in={view === 'form'}>
            <Box sx={{ mt: 1, textAlign: 'left' }}>
              <Typography variant="h5" sx={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700, mb: 3, textAlign: 'center', color: '#2d3436' }}>
                Guest Details
              </Typography>

              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#636e72', fontFamily: 'Quicksand, sans-serif' }}>
                Gender
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <StyledChip 
                  label="Male" 
                  onClick={() => setGender('male')}
                  selected={gender === 'male'}
                  gender="male"
                  clickable
                />
                <StyledChip 
                  label="Female" 
                  onClick={() => setGender('female')}
                  selected={gender === 'female'}
                  gender="female"
                  clickable
                />
              </Stack>

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#636e72', fontFamily: 'Quicksand, sans-serif' }}>
                College
              </Typography>
              
              <SearchableCollegeSelect
                value={college === 'other' ? '' : college}
                onChange={(newValue) => {
                  setCollege(newValue || 'other');
                  if (newValue) {
                    setCollegeName('');
                  }
                }}
                colleges={colleges}
                gender={gender}
                placeholder="Search and select your college..."
              />

              {(college === 'other' || !college || college === '') && (
                <TextField
                  fullWidth
                  placeholder="Enter your college name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  sx={{ 
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '1rem',
                      fontFamily: 'Quicksand, sans-serif',
                      background: 'rgba(255,255,255,0.5)',
                      '& fieldset': { borderColor: '#dfe6e9' },
                      '&:hover fieldset': { borderColor: '#b2bec3' },
                      '&.Mui-focused fieldset': { 
                        borderColor: gender === 'male' ? 'rgba(79, 195, 247, 0.6)' : 'rgba(236, 64, 122, 0.6)'
                      },
                    }
                  }}
                />
              )}

              <Box sx={{ textAlign: 'center' }}>
                <StyledButton
                  variant="contained"
                  onClick={handleStart}
                  disabled={showButtonLoading}
                  gender={gender}
                  sx={{ 
                    minWidth: '200px',
                    opacity: showButtonLoading ? 0.7 : 1
                  }}
                >
                  {showButtonLoading ? 'Starting...' : (mode === 'audiocall' ? 'Start Calling' : 'Start Chatting')}
                </StyledButton>
              </Box>
            </Box>
          </Fade>
        )}
      </GlassDialogContent>
    </Dialog>
  );
};

export default UserVerificationDialog;
