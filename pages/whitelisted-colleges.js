// pages/whitelisted-colleges.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

const GlassCard = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  borderRadius: '1.5rem',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  boxShadow: '0 8px 32px -8px rgba(31, 38, 135, 0.2)',
  padding: '1.5rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px -8px rgba(31, 38, 135, 0.3)',
  },
});

const HeaderGradient = styled(Box)({
  background: 'linear-gradient(135deg, rgba(255, 89, 115, 0.9) 0%, rgba(79, 195, 247, 0.9) 100%)',
  backdropFilter: 'blur(20px)',
  padding: '3rem 0',
  marginBottom: '3rem',
  borderRadius: '0 0 2rem 2rem',
  boxShadow: '0 8px 32px -8px rgba(31, 38, 135, 0.3)',
});

const StyledSearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '1.5rem',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    fontSize: '1.1rem',
    fontFamily: 'Quicksand, sans-serif',
    '& fieldset': {
      borderColor: 'rgba(255, 89, 115, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 89, 115, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 89, 115, 0.8)',
      borderWidth: '2px',
    },
  },
});

const RecommendButton = styled(Button)({
  borderRadius: '2rem',
  padding: '0.8rem 2rem',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1.1rem',
  fontFamily: 'Quicksand, sans-serif',
  background: 'rgba(255, 255, 255, 0.9)',
  color: '#FF5973',
  border: '2px solid rgba(255, 89, 115, 0.3)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 16px -4px rgba(255, 89, 115, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 89, 115, 0.1)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px -4px rgba(255, 89, 115, 0.4)',
  },
});

export default function WhitelistedColleges() {
  const router = useRouter();
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('/api/getdetails/getcolleges');
        if (response.ok) {
          const data = await response.json();
          // Already sorted alphabetically from the API
          setColleges(data);
          setFilteredColleges(data);
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredColleges(colleges);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = colleges.filter(
        (college) =>
          college.college.toLowerCase().includes(query) ||
          college.emailendswith.toLowerCase().includes(query)
      );
      setFilteredColleges(filtered);
    }
  }, [searchQuery, colleges]);

  const handleRecommend = () => {
    router.push('/give-your-suggestion?category=add-college');
  };

  return (
    <>
      <Head>
        <title>Whitelisted Colleges on Spyll | Find Your College</title>
        <meta
          name="description"
          content="Browse all verified colleges and universities on Spyll. Find your institution and connect with fellow students anonymously."
        />
        <meta name="keywords" content="spyll colleges, whitelisted colleges, verified colleges, college list, university list" />
      </Head>

      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ffeef0 0%, #e3f2fd 100%)' }}>
        <HeaderGradient>
          <Container maxWidth="lg">
            <Fade in timeout={800}>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#fff',
                    textAlign: 'center',
                    fontFamily: 'Quicksand, sans-serif',
                    mb: 1,
                    textShadow: '0 2px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  Whitelisted Colleges on Spyll
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    textAlign: 'center',
                    fontFamily: 'Quicksand, sans-serif',
                    fontWeight: 400,
                    mb: 3,
                  }}
                >
                  Find your institution among {colleges.length}+ verified colleges
                </Typography>
              </Box>
            </Fade>
          </Container>
        </HeaderGradient>

        <Container maxWidth="lg" sx={{ pb: 6 }}>
          {/* Recommend Section */}
          <Fade in timeout={1000}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <RecommendButton
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleRecommend}
              >
                Don't see your college? Recommend us!
              </RecommendButton>
            </Box>
          </Fade>

          {/* Search */}
          <Fade in timeout={1200}>
            <Box sx={{ mb: 4 }}>
              <StyledSearchField
                fullWidth
                placeholder="Search by college name or email domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#FF5973', fontSize: '1.8rem' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Fade>

          {/* Loading */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#FF5973' }} />
            </Box>
          )}

          {/* College Grid */}
          {!loading && (
            <Fade in timeout={1400}>
              <Box>
                {filteredColleges.length === 0 ? (
                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: 'center',
                      color: '#636e72',
                      fontFamily: 'Quicksand, sans-serif',
                      py: 8,
                    }}
                  >
                    No colleges found matching "{searchQuery}"
                  </Typography>
                ) : (
                  <Grid container spacing={3}>
                    {filteredColleges.map((college, index) => (
                      <Grid item xs={12} sm={6} md={4} key={college._id || index}>
                        <Fade in timeout={1400 + index * 50}>
                          <GlassCard>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                              <SchoolIcon sx={{ color: '#FF5973', fontSize: '1.5rem', mr: 1, mt: 0.3 }} />
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  color: '#2d3436',
                                  fontFamily: 'Quicksand, sans-serif',
                                  fontSize: '1.1rem',
                                  lineHeight: 1.3,
                                }}
                              >
                                {college.college}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <EmailIcon sx={{ color: '#4FC3F7', fontSize: '1.2rem', mr: 1 }} />
                              <Chip
                                label={`@${college.emailendswith}`}
                                size="small"
                                sx={{
                                  background: 'rgba(79, 195, 247, 0.15)',
                                  color: '#01579b',
                                  fontFamily: 'Quicksand, sans-serif',
                                  fontWeight: 600,
                                  border: '1px solid rgba(79, 195, 247, 0.3)',
                                }}
                              />
                            </Box>
                          </GlassCard>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Fade>
          )}
        </Container>
      </Box>
    </>
  );
}
