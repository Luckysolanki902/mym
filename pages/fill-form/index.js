import { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Button, CircularProgress, Snackbar } from '@mui/material';

const FillForm = () => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [recreateBug, setRecreateBug] = useState('');
  const [loading, setLoading] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/feedbacks/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, description, recreateBug }),
      });
      setSuccessSnackbarOpen(true);
      // Reset form fields after successful submission
      setCategory('');
      setDescription('');
      setRecreateBug('');
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSuccessSnackbarOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '3rem' }}>
      <FormControl fullWidth sx={{ maxWidth: '700px' }}>
        <InputLabel>Select Category</InputLabel>
        <Select variant='standard' value={category} onChange={(e) => setCategory(e.target.value)} required>
          <MenuItem value="Add My College">Add My College</MenuItem>
          <MenuItem value="Bug Report">Bug Report</MenuItem>
          <MenuItem value="Suggestion">Suggestion</MenuItem>
          <MenuItem value="Confession Delete Request">Confession Delete Request</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Description"
        multiline
        maxRows={5}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        required
        sx={{ maxWidth: '700px' }}
        variant='standard'
      />
      {category === 'Bug Report' && (
        <TextField
          label="How can we recreate the bug?"
          value={recreateBug}
          onChange={(e) => setRecreateBug(e.target.value)}
          fullWidth
          sx={{ maxWidth: '700px' }}
          variant='standard'
        />
      )}

      {category === 'Add My College' && (
        <TextField
          label="Name of Your college"
          value={collegeName}
          onChange={(e) => setCollegeName(e.target.value)}
          fullWidth
          required
          sx={{ maxWidth: '700px' }}
          variant='standard'
        />
      )}
      {category === 'Add My College' && (
        <TextField
          label="What's your college id?"
          value={collegeId}
          onChange={(e) => setCollegeId(e.target.value)}
          fullWidth
          required
          sx={{ maxWidth: '700px' }}
          variant='standard'
        />
      )}
      <Button fullWidth sx={{ maxWidth: '300px' }} type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
      </Button>
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Form submitted successfully"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </form>
  );
};

export default FillForm;
