// pages/addcollege.js
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, TextField, Button, Snackbar, InputAdornment, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import Link from 'next/link';
const AddCollege = () => {
  const [college, setCollege] = useState('');
  const [emailEndsWith, setEmailEndsWith] = useState('');
  const [colleges, setColleges] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchColleges = async () => {
    const response = await fetch('/api/admin/college/getcolleges');
    const data = await response.json();
    setColleges(data);
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Call the API to add the college
    const response = await fetch('/api/admin/college/addcollege', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ college, emailEndsWith }),
    });

    const data = await response.json();

    if (response.ok) {
      setSnackbarMessage('College added successfully!');
      fetchColleges(); // Refresh the list of colleges after adding a new one
    } else {
      setSnackbarMessage(data.message || 'Error adding college');
    }

    setSnackbarOpen(true);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" style={{ flexGrow: 1, textAlign: 'center', cursor: 'pointer' }}>
            <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>
              Admin Panel
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <div style={{ display: 'block', backgroundColor: 'rgb(35,35,35)', margin: '0', padding: '0' }}>
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
              backgroundColor: 'rgb(45, 45, 45)',
              marginBottom: '2rem'
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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

          <Paper style={{ maxWidth: '800px', width: '100%', padding: '20px', backgroundColor: 'rgb(45, 45, 45)' }}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Added Colleges</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: 'white', fontWeight: 500, fontSize: '1.2rem' }}>College Name</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 500, fontSize: '1.2rem' }}>Email Ends With</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {colleges.map((college) => (
                  <TableRow key={college._id}>
                    <TableCell style={{ color: 'white', }}>{college.college}</TableCell>
                    <TableCell style={{ color: 'white' }}>{college.emailendswith}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default AddCollege;
