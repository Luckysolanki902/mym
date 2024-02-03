// pages/addcollege.js
import React, { useState } from 'react';
import { TextField, Button, Snackbar, InputAdornment } from '@mui/material';

const AddCollege = () => {
  const [college, setCollege] = useState('');
  const [emailEndsWith, setEmailEndsWith] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Call the API to add the college
    const response = await fetch('/api/admin/addcollege', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ college, emailEndsWith }),
    });

    const data = await response.json();

    if (response.ok) {
      setSnackbarMessage('College added successfully!');
    } else {
      setSnackbarMessage(data.message || 'Error adding college');
    }

    setSnackbarOpen(true);
  };

  return (
    <div style={{ display: 'block' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
        }}
      >
        <div
          style={{
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '100%',
          }}
        >
          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'2rem'}}>
            <TextField
              label="College Name"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              required
            />
            <TextField
              label="Email Ends With"
              value={emailEndsWith}
              onChange={(e) => setEmailEndsWith(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">@</InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" color="primary">
              Add College
            </Button>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
              onClose={handleSnackbarClose}
              message={snackbarMessage}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCollege;
