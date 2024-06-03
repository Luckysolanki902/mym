import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Chip, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import Link from 'next/link';

const EditTestIdsDetails = () => {
  const [testIds, setTestIds] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
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

  useEffect(() => {
    if (testIds.length > 0) {
      // Fetch user details for the test IDs
      const fetchUserDetails = async () => {
        const response = await fetch('/api/admin/testids/getdetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ testIds }),
        });
        const data = await response.json();
        setUserDetails(data);
      };

      fetchUserDetails();
    }
  }, [testIds]);

  const handleGenderChange = async (email, newGender) => {
    // Update the gender in the database
    const response = await fetch('/api/admin/testids/updategender', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, gender: newGender }),
    });

    const data = await response.json();

    if (response.ok) {
      setSnackbarMessage('Gender updated successfully');
      setUserDetails(userDetails.map(user =>
        user.email === email ? { ...user, gender: newGender } : user
      ));
    } else {
      setSnackbarMessage(data.message || 'Error updating gender');
    }

    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
        <div style={{ padding: '20px', color: 'white' }}>
          <h2 style={{ margin: '0', marginBottom: '1rem' }}>Available TestIDs:</h2>
          <div style={{ display: 'flex', width: '100%', overflow: 'auto', flexWrap: 'nowrap', padding: '0 1rem', gap: '1rem' }}>
            {testIds.map((id) => (
              <Chip key={id} label={id} />
            ))}
          </div>

          <h2>User Details:</h2>
          <div style={{overflow:'auto'}}>

          <Table style={{ marginTop: '20px' }}>
            <TableHead>
              <TableRow>
                <TableCell style={{ color: 'white' }}>Email</TableCell>
                <TableCell style={{ color: 'white' }}>Gender</TableCell>
                <TableCell style={{ color: 'white' }}>College</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userDetails.map((user) => (
                <TableRow key={user.email}>
                  <TableCell style={{ color: 'white' }}>{user.email}</TableCell>
                  <TableCell style={{ color: 'white' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '8px' }}>
                      <Chip
                        label="Male"
                        color={user.gender === 'male' ? 'primary' : 'default'}
                        onClick={() => handleGenderChange(user.email, 'male')}
                        />
                      <Chip
                        label="Female"
                        color={user.gender === 'female' ? 'primary' : 'default'}
                        onClick={() => handleGenderChange(user.email, 'female')}
                        />
                    </div>
                  </TableCell>
                  <TableCell style={{ color: 'white' }}>{user.college}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
            message={snackbarMessage}
            />
        </div>
      </div>
    </div>
  );
};

export default EditTestIdsDetails;
