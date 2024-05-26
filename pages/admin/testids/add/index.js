// pages/admin/testids/addTestId.js
import React, { useState , useEffect} from 'react';
import { TextField, Button, Snackbar, Chip } from '@mui/material';

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
    <div style={{ display: 'block', backgroundColor: 'rgb(35,35,35)', margin: '0', padding: '0', }}>
      <div style={{position:'fixed', top:'0', left:'2rem', width:'100%'}}>
        <h2>Available TestIDs:</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
          minHeight: '100vh',
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
  );
};

export default AddTestId;
