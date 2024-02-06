import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';

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

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Authentication Required</DialogTitle>
      <DialogContent>
        <p>Please sign in or create an account to perform this action.</p>
        <Button color="primary" onClick={handleSignIn}>
          Sign In
        </Button>
        <Button color="primary" onClick={handleSignUp}>
          Sign Up
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPrompt;
