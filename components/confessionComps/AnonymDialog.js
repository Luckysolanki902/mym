import React, { useState, useEffect, useCallback, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Button, CircularProgress } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';

const AnonymDialog = ({
  open,
  onClose,
  handleAnonymousReply,
  anonymousReplyValue,
  setAnonymousReplyValue,
}) => {
  const [sending, setSending] = useState(false);
  const isDialogOpenRef = useRef(open); // Ref to track dialog state

  // Function to handle closing the dialog
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    isDialogOpenRef.current = open;

    if (open) {
      // Push a new history state when the dialog opens
      window.history.pushState({ dialog: true }, '');

      // Define the popstate handler
      const handlePopState = (event) => {
        if (isDialogOpenRef.current) {
          // If the dialog is open, close it
          handleClose();
        }
      };

      // Add the popstate event listener
      window.addEventListener('popstate', handlePopState);

      // Cleanup function to remove the event listener when the dialog closes
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [open, handleClose]);

  useEffect(() => {
    // Focus the textarea when the dialog is open
    if (open) {
      const textarea = document.getElementById('anonymous-reply-textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  }, [open]);

  const handleSendReply = async () => {
    try {
      setSending(true);
      await handleAnonymousReply(anonymousReplyValue);
      setAnonymousReplyValue('');
      handleClose();
    } catch (error) {
      console.error('Error sending anonymous reply:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          minHeight: '40vh',
          width: 'calc(100% - 40px)',
          borderRadius: '1rem',
          // Add top-left and top-right radii
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
        },
      }}
    >
      {/* Optional: Uncomment and customize DialogTitle if needed
      <DialogTitle>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>Reply Anonymously</div>
          <Button onClick={handleClose}>
            <CloseRounded />
          </Button>
        </div>
      </DialogTitle>
      */}
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
        >
        <textarea
          id="anonymous-reply-textarea" // Added ID for easier access
          type="text"
          placeholder="Share your thoughts, they’ll never know it’s you…"
          style={{
            marginTop: '0.1rem',
            border: 'none',
            outline: 'none',
            flex: 1,
            fontFamily: 'Quicksand, sans-serif',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#2d3436',
            resize: 'none',
            background: 'transparent',
            lineHeight: '1.6',
          }}
          value={anonymousReplyValue}
          onChange={(e) => setAnonymousReplyValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendReply();
            }
          }}
          autoFocus
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendReply}
          disabled={anonymousReplyValue.trim() === ''}
          sx={{
            marginTop: '1rem',
            width: 'fit-content',
            alignSelf: 'flex-end',
            textTransform: 'none',
            background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '2rem',
            padding: '0.5rem 1.5rem',
            fontFamily: 'Quicksand, sans-serif',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(108, 92, 231, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5f27cd 0%, #8e44ad 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(108, 92, 231, 0.4)',
            },
            '&:disabled': {
              background: 'rgba(150, 150, 150, 0.3)',
              boxShadow: 'none',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {sending ? <CircularProgress size={24} color="inherit" /> : 'Send'}
        </Button>
        </motion.div>
      </DialogContent>
      {/* Optional: Add a close button in the top-right corner */}
      {/* <Button
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          minWidth: 'unset',
          padding: '0.25rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          },
        }}
        aria-label="Close dialog"
      >
        <CloseRounded />
      </Button> */}
    </Dialog>
  );
};

export default AnonymDialog;
