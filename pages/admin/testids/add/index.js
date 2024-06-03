// pages/admin/testids/addTestId.js
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, TextField, Button, Snackbar, Chip, Typography } from '@mui/material';
import Link from 'next/link';
const AddTestId = () => {
  const [email, setEmail] = useState('');
  const [testIds, setTestIds] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');


  useEffect(() => {
    // Fetch the test IDs
    const fetchTestIds = async () => {
      const response = await fetch('/api/admin/testids/get');
      const data = await response.json();
      setTestIds(data.map(testEmail => testEmail.email));
    };

    fetchTestIds();
  }, []);
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Call the API to add the test email ID
    const response = await fetch('/api/admin/testids/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      setSnackbarMessage('Test email added successfully!');
    } else {
      setSnackbarMessage(data.message || 'Error adding test email');
    }
    setEmail('')
    setSnackbarOpen(true);
  };

  return (
    <div style={{minHeight:'100vh',  backgroundColor: 'rgb(35,35,35)'}}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" style={{ flexGrow: 1, textAlign: 'center', cursor: 'pointer' }}>
            <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>
              Admin Panel
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <div style={{ display: 'block', backgroundColor: 'rgb(35,35,35)', margin: '0', padding: '0', }}>
        <div>
          <h2 style={{ margin: '0', marginBottom: '1rem', marginLeft:'1rem' }}>Available TestIDs:</h2>
          <div style={{ display: 'flex', width: '100%', overflow: 'auto', flexWrap: 'nowrap', padding:'0 1rem', gap:'1rem' }}>
            {testIds.map((id) => (
              <Chip key={id} label={id} />
            ))}
          </div>

        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '3rem'
          }}
        >
          <div
            style={{
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              width: '100%',
              backgroundColor: 'rgb(45, 45, 45)'
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type='email'
              />
              <Button type="submit" variant="contained" color="primary">
                Add Test Email
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
    </div>
  );
};

export default AddTestId;
