import { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Button, CircularProgress, Snackbar, InputAdornment } from '@mui/material';

const FillForm = () => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [recreateBug, setRecreateBug] = useState('');
  const [loading, setLoading] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [confessionLink, setConfessionLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/feedbacks/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, description, recreateBug, collegeName, collegeId, confessionLink }),
      });
      setSuccessSnackbarOpen(true);
      // Reset form fields after successful submission
      setCategory('');
      setDescription('');
      setRecreateBug('');
      setCollegeName('');
      setCollegeId('');
      setConfessionLink('');
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
label={category === 'Add My College' ? "Any Message For Us" : category === 'Confession Delete Request' ? "Reason" : "Description"}
multiline
        minRows={2}
        maxRows={5}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        required={category !== 'Add My College'}
        sx={{ maxWidth: '700px' }}
        variant='standard'
      />

      {category === 'Confession Delete Request' && (
        <TextField
          label="Paste the confession link"
          value={confessionLink}
          onChange={(e) => setConfessionLink(e.target.value)}
          fullWidth
          required
          sx={{ maxWidth: '700px' }}
          variant='standard'
          placeholder='Just click on the share icon on the confession and click on copy link'
        />
      )}

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
        <>
          <TextField
            label="Name of Your College"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            fullWidth
            required
            sx={{ maxWidth: '700px' }}
            variant='standard'
          />
          <TextField
            label="What your college ID ends with?"
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            fullWidth
            required
            sx={{ maxWidth: '700px' }}
            variant='standard'
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">@</InputAdornment>
              ),
            }}
          />
        </>
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
