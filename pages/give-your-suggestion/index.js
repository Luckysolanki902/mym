import { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Button, CircularProgress, Snackbar, InputAdornment, Typography, Box, Container } from '@mui/material';
import CustomHead from '@/components/seo/CustomHead';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

const GlassContainer = styled(Box)({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  borderRadius: '2rem',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: '3rem',
  maxWidth: '800px',
  width: '100%',
  margin: '0 auto',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#0984e3',
      borderWidth: '2px',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    }
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Quicksand, sans-serif',
    color: '#636e72',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#0984e3',
    fontWeight: 600,
  }
});

const StyledSelect = styled(Select)({
  borderRadius: '1rem',
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#0984e3',
    borderWidth: '2px',
  },
});

const SubmitButton = styled(Button)({
  borderRadius: '2rem',
  padding: '1rem 3rem',
  background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1.1rem',
  textTransform: 'none',
  fontFamily: 'Quicksand, sans-serif',
  boxShadow: '0 4px 15px rgba(9, 132, 227, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(9, 132, 227, 0.4)',
    background: 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)',
  },
  '&:disabled': {
    background: '#b2bec3',
    color: '#dfe6e9',
  }
});

const FillForm = () => {
  const router = useRouter()
  const queryCategory = router.query.category || '';
  const collegedomain = router.query.collegedomain || '';
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [recreateBug, setRecreateBug] = useState('');
  const [loading, setLoading] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [confessionLink, setConfessionLink] = useState('');
  const [email, setEmail] = useState('');

  useEffect(()=>{
    if(queryCategory === 'add-college'){
      setCategory('Add My College')
    }
    if(collegedomain){
      setCollegeId(collegedomain)
    }
  },[queryCategory, collegedomain])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/feedbacks/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, description, recreateBug, collegeName, collegeId, confessionLink, email }),
      });
      setSuccessSnackbarOpen(true);
      // Reset form fields after successful submission
      setCategory('');
      setDescription('');
      setRecreateBug('');
      setCollegeName('');
      setCollegeId('');
      setConfessionLink('');
      setEmail('');
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
    <>
      <CustomHead title={'Add My college or Give Feedback'} description={'Add your college to Spyll (so, no worry if your college is not on spyll yet) or provide feedback to improve our platform. Submit your college details, report bugs, suggest improvements, or request confession deletions with our easy-to-use form."'} />
      
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 8,
        px: 2
      }}>
        <GlassContainer>
          <Typography variant="h3" align="center" sx={{ 
            mb: 4, 
            fontFamily: 'Quicksand, sans-serif', 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2d3436 30%, #636e72 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            We Value Your Voice
          </Typography>
          
          <Typography variant="body1" align="center" sx={{ mb: 6, color: '#636e72', fontFamily: 'Quicksand, sans-serif', maxWidth: '600px', mx: 'auto' }}>
            Whether it&apos;s adding your college, reporting a bug, or sharing a brilliant idea, we&apos;re all ears. Help us make Spyll better for everyone.
          </Typography>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: 'Quicksand, sans-serif' }}>Select Category</InputLabel>
              <StyledSelect
                value={category}
                label="Select Category"
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <MenuItem value="Add My College">Add My College</MenuItem>
                <MenuItem value="Bug Report">Bug Report</MenuItem>
                <MenuItem value="Suggestion">Suggestion</MenuItem>
                <MenuItem value="Confession Delete Request">Confession Delete Request</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </StyledSelect>
            </FormControl>

            {category === 'Confession Delete Request' && (
              <StyledTextField
                label="Paste the confession link"
                value={confessionLink}
                onChange={(e) => setConfessionLink(e.target.value)}
                fullWidth
                required
                placeholder='Just click on the share icon on the confession and click on copy link'
              />
            )}

            {category === 'Bug Report' && (
              <StyledTextField
                label="How can we recreate the bug?"
                value={recreateBug}
                onChange={(e) => setRecreateBug(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            )}

            {category === 'Add My College' && (
              <>
                <StyledTextField
                  label="Name of Your College"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  fullWidth
                  required
                />
                <StyledTextField
                  label="What your college ID ends with?"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    placeholder:'iitk.ac.in',
                    startAdornment: (
                      <InputAdornment position="start">@</InputAdornment>
                    ),
                  }}
                />

                <StyledTextField
                  label="Your Email (Optional)"
                  value={email}
                  type='email'
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  helperText="Get notified when it's added"
                />
              </>
            )}

            <StyledTextField
              label={category === 'Add My College' ? "Any Message For Us (Optional)" : category === 'Confession Delete Request' ? "Reason" : "Description"}
              multiline
              minRows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required={category !== 'Add My College'}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <SubmitButton 
                type="submit" 
                disabled={loading}
                fullWidth
                sx={{ maxWidth: '300px' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Feedback'}
              </SubmitButton>
            </Box>
          </form>
        </GlassContainer>
      </Box>
      
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Form submitted successfully"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default FillForm;
