// app/marketing/page.js
'use client';

import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import axios from 'axios';

const MarketingPage = () => {
  const [femaleCount, setFemaleCount] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState([]);
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true)

    try {
      const response = await axios.post('/api/admin/marketing/send-mails', {
        femaleCount,
        maleCount,
      });

      setEmailStatus(response.data.results);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error sending emails:', error);
      // Optionally, handle errors and show feedback to the user
    }
    finally {
      setSending(false)
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Mail Marketing
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Number of Females"
          type="number"
          fullWidth
          margin="normal"
          value={femaleCount}
          onChange={(e) => setFemaleCount(Number(e.target.value))}
          inputProps={{ min: 0 }}
          required
        />
        <TextField
          label="Number of Males"
          type="number"
          fullWidth
          margin="normal"
          value={maleCount}
          onChange={(e) => setMaleCount(Number(e.target.value))}
          inputProps={{ min: 0 }}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '1rem' }}
        >
          {sending ? 'Sending...' : 'Send Emails'}
        </Button>
      </form>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Email Sending Status</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emailStatus.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    {item.status === 'sent' ? (
                      <Typography color="green">Sent</Typography>
                    ) : (
                      <Typography color="red">Not Sent</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MarketingPage;
