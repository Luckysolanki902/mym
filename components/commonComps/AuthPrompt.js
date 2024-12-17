import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { Box } from '@mui/material';

const AuthPrompt = ({ open, onClose }) => {
  const router = useRouter();

  const handleSignIn = () => {
    // Navigate to the sign-in page
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    // Navigate to the sign-up page
    router.push('/auth/signup');
  };

  const StyledDialogContent = styled(DialogContent)({
    padding: '1rem 3rem',
    borderRadius: '1.5rem',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)',
}); 

const StyledButton = styled(Button)(() => ({
  backgroundColor: 'rgb(50, 50, 50)',
  color: '#fff',
  borderRadius: '0.6rem',
  textTransform: 'capitalize',
  transition: 'background-color 0.3s ease, transform 0.2s ease',
  ':hover': {
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
  },
}));


  return (
    <Dialog open={open} onClose={onClose}
    PaperProps={{
      style: {
          borderRadius: '1.5rem',
          overflow: 'hidden',
          maxWidth: '650px',
      },
  }}
  >
      <StyledDialogContent>
        <p>Please login to continue!</p>
        <Box sx={{display:'flex', width:'100%', alignItems:'center', justifyContent:'center', marginTop:'2rem', gap:'2rem'}}>
        <StyledButton color="primary" onClick={handleSignIn}>
          Login
        </StyledButton>
        <Button sx={{borderRadius:'0.6rem'}} color="primary" onClick={handleSignUp}>
          Sign Up
        </Button>
        </Box>
      </StyledDialogContent>
    </Dialog>
  );
};

export default AuthPrompt;
