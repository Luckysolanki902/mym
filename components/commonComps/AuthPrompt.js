import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { Box, Typography, Stack } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

const AuthPrompt = ({ open, onClose }) => {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const GlassDialogContent = styled(DialogContent)({
    padding: '2rem 2.5rem',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 12px 48px -12px rgba(31, 38, 135, 0.15)',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  });

  const StyledButton = styled(Button)(() => ({
    background: 'linear-gradient(135deg, #2d3436 0%, #000 100%)',
    color: '#fff',
    borderRadius: '1.2rem',
    padding: '0.9rem 2rem',
    fontWeight: 600,
    fontFamily: 'Quicksand, sans-serif',
    textTransform: 'none',
    fontSize: '1rem',
    boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.25)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(135deg, #000 0%, #2d3436 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.35)',
    },
  }));

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        style: {
          borderRadius: '1.5rem',
          overflow: 'hidden',
          maxWidth: '420px',
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      <GlassDialogContent>
        {/* Icon */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 2 
        }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.15) 0%, rgba(236, 64, 122, 0.15) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <LoginIcon sx={{ fontSize: 24, color: '#2d3436' }} />
          </Box>
        </Box>

        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'Quicksand, sans-serif', 
            fontWeight: 700, 
            mb: 1,
            color: '#2d3436',
            fontSize: '1.3rem'
          }}
        >
          Login to See More
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'Quicksand, sans-serif', 
            color: '#636e72', 
            mb: 2.5,
            lineHeight: 1.6,
            fontSize: '0.95rem'
          }}
        >
          You&apos;ve reached the preview limit. Sign in to unlock all confessions and join the conversation.
        </Typography>

        {/* Benefits */}
        <Box sx={{ 
          mb: 2.5,
          p: 1.5,
          borderRadius: '1rem',
          background: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.6)'
        }}>
          <Stack spacing={1}>
            {[
              'Read unlimited confessions',
              'Post your own stories',
              'Reply to confessions privately',
            ].map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 18, 
                  height: 18, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  ✓
                </Box>
                <Typography sx={{ 
                  fontFamily: 'Quicksand, sans-serif', 
                  fontSize: '0.85rem', 
                  color: '#2d3436',
                  fontWeight: 500
                }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <StyledButton 
          fullWidth 
          onClick={handleSignIn}
          startIcon={<LoginIcon />}
        >
          Sign In to Continue
        </StyledButton>
        
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            mt: 1.5, 
            color: 'rgba(99, 110, 114, 0.9)',
            fontFamily: 'Quicksand, sans-serif',
            fontSize: '0.8rem'
          }}
        >
          Quick sign-in with college email
        </Typography>
      </GlassDialogContent>
    </Dialog>
  );
};

export default AuthPrompt;
