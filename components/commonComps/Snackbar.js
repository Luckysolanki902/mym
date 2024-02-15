import React, { useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const CustomSnackbar = ({ open, onClose, message, color }) => {
  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose(false);
  }, [onClose]);

  return (
    <Snackbar open={open} autoHideDuration={2000} onClose={handleSnackbarClose} anchorOrigin={{horizontal:'center', vertical:'top'}}>
      <MuiAlert
        elevation={6}
        variant="filled"
        onClose={handleSnackbarClose}
        severity="info"
        style={{ backgroundColor: color }}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default CustomSnackbar;
