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
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

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
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // User State
  const [userType, setUserType] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Session
  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
      setLoading(false);
    };
    fetchSession();
  }, []);

  // 2. Determine User Type - Now only signed in users can access
  useEffect(() => {
    if (loading) return;
    const decideUserType = () => {
      if (session?.user?.email) {
        setUserType('signedIn');
      } else {
        setUserType('notSignedIn');
      }
    };
    decideUserType();
  }, [session, loading]);

  // 3. Open Logic - Show dialog if user is not signed in
  useEffect(() => {
    if (!userType) return;

    const checkAndOpen = () => {
      if (userType === 'signedIn') {
        // Signed in users can proceed
        return;
      } else {
        // Not signed in - show dialog
        setOpen(true);
      }
    };

    const timer = setTimeout(checkAndOpen, 100);
    return () => clearTimeout(timer);
  }, [userType]);

  const handleSignIn = () => {
    router.push('/auth/signin');
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
      <GlassDialogContent>
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

        <Fade in={true}>
          <Box sx={{ mt: 2 }}>
            {/* Icon */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 2.5 
            }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.15) 0%, rgba(236, 64, 122, 0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}>
                <LoginIcon sx={{ fontSize: 28, color: '#2d3436' }} />
              </Box>
            </Box>

            <Typography variant="h5" sx={{ 
              fontFamily: 'Quicksand, sans-serif', 
              fontWeight: 700, 
              mb: 1.5, 
              color: '#2d3436',
              fontSize: { xs: '1.4rem', sm: '1.6rem' }
            }}>
              Sign in with your college email
            </Typography>
            
            <Typography variant="body2" sx={{ 
              fontFamily: 'Quicksand, sans-serif', 
              color: '#636e72', 
              mb: 3, 
              lineHeight: 1.7,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              px: { xs: 0, sm: 2 }
            }}>
              Connect with verified college students. Sign in with your college email for the best experience.
            </Typography>

            {/* Benefits */}
            {/* <Box sx={{ 
              mb: 3,
              p: 2,
              borderRadius: '1rem',
              background: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.6)'
            }}>
              <Stack spacing={1.5}>
                {[
                  { icon: '✓', text: 'Verified badge on your profile' },
                  { icon: '✓', text: 'Access to Chat & Call features' },
                  { icon: '✓', text: 'Better matches with trusted users' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ 
                      fontFamily: 'Quicksand, sans-serif', 
                      fontSize: '0.9rem', 
                      color: '#2d3436',
                      fontWeight: 500
                    }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box> */}

            <StyledButton
              variant="contained"
              fullWidth
              onClick={handleSignIn}
              startIcon={<LoginIcon />}
              sx={{ 
                maxWidth: '100%',
                py: 1.5,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #2d3436 0%, #000 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #000 0%, #2d3436 100%)',
                }
              }}
            >
              Sign In
            </StyledButton>
            
            <Typography variant="caption" sx={{ 
              display: 'block',
              mt: 2, 
              color: 'rgba(99, 110, 114, 0.9)',
              fontFamily: 'Quicksand, sans-serif'
            }}>
              Takes less than 10 seconds
            </Typography>
          </Box>
        </Fade>
      </GlassDialogContent>
    </Dialog>
  );
};

export default UserVerificationDialog;
