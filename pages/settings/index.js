// pages/settings.js

import React, { useEffect, useState } from 'react';
import { getSession, signOut } from 'next-auth/react';
import {
  Container,
  Typography,
  Box,
  Button,
  Avatar,
  Grid,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import Link from 'next/link';

const SettingsContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const ProfileBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const SettingsPage = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const sess = await getSession();
      setSession(sess);
    };
    fetchSession();
  }, []);

  const handleLogout = () => {
    signOut();
  };

  return (
    <SettingsContainer maxWidth="md">
      <Typography variant="h4" gutterBottom align="center">
        Settings
      </Typography>

      {session ? (
        <>
          <ProfileBox elevation={3}>
            <Avatar
              alt={session.user.name}
              src={session.user.image}
              sx={{ width: 100, height: 100, margin: '0 auto', mb: 2 }}
            />
            <Typography variant="h6">{'Anonymous'}</Typography>
          </ProfileBox>

          <Box mt={4}>
            <Grid container spacing={3}>
              {/* Example Settings Option */}

              {/* <Grid item xs={12} sm={6}>
                <Link href="/settings/profile" passHref>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ height: '100%', textTransform: 'none' }}
                  >
                    Manage Profile
                  </Button>
                </Link>
              </Grid> */}

              {/* <Grid item xs={12} sm={6}>
                <Link href="/settings/account" passHref>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ height: '100%', textTransform: 'none' }}
                  >
                    Account Settings
                  </Button>
                </Link>
              </Grid> */}

              {/* Add more settings options here as needed */}

              {/* Logout Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Grid>
            </Grid>
          </Box>
        </>
      ) : (
        <Box textAlign="center" mt={5}>
          <Typography variant="h6" gutterBottom>
            You are not logged in.
          </Typography>
          <Link href="/api/auth/signin" passHref>
            <Button variant="contained" color="primary">
              Sign In
            </Button>
          </Link>
        </Box>
      )}
    </SettingsContainer>
  );
};

export default SettingsPage;
