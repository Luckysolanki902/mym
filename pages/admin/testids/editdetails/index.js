// pages/admin/testids/editdetails.js
import React, { useState, useEffect } from 'react';
import { Chip, Snackbar, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

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
    <div style={{ display: 'block', backgroundColor: 'rgb(35,35,35)', margin: '0', padding: '0' }}>
      <div style={{ padding: '20px', color: 'white' }}>
        <h2>Available TestIDs:</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {testIds.map((id) => (
            <Chip key={id} label={id} />
          ))}
        </div>

        <h2>User Details:</h2>
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
                  <Chip
                    label="Male"
                    color={user.gender === 'male' ? 'primary' : 'default'}
                    onClick={() => handleGenderChange(user.email, 'male')}
                    style={{ marginRight: '8px' }}
                  />
                  <Chip
                    label="Female"
                    color={user.gender === 'female' ? 'primary' : 'default'}
                    onClick={() => handleGenderChange(user.email, 'female')}
                  />
                </TableCell>
                <TableCell style={{ color: 'white' }}>{user.college}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
        />
      </div>
    </div>
  );
};

export default EditTestIdsDetails;
