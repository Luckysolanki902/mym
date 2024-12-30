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

const SettingsContainer = styled(Container)(() => ({
  paddingTop: '1rem',
  paddingBottom: '1rem',
}));

const ProfileBox = styled(Paper)(() => ({
  padding: '1rem',
  textAlign: 'center',
}));

const SettingsPage = ({ userDetails }) => {
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

              {userDetails && <Grid item xs={12} sm={6}>
                <Box >
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ height: '100%', textTransform: 'capitalize' }}
                  >
                    {userDetails?.gender}
                  </Button>
                </Box>
              </Grid>}

              {userDetails && <Grid item xs={12} sm={6}>
                <Box >
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ height: '100%', textTransform: 'none' }}
                  >
                    {userDetails?.college}
                  </Button>
                </Box>
              </Grid>}

              {/* Add more settings options here as needed */}
              <Grid item xs={12}>
                <Typography
                  variant="body1"
                  sx={{
                    fontStyle: 'italic',
                    color: 'rgba(0, 0, 0, 0.6)',
                    textAlign: 'center',
                    mt: 2,
                    fontFamily: 'Jost',
                  }}
                >
                  You can't change these details.
                </Typography>
              </Grid>

              {/* Logout Button */}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
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



export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = process.env.NEXT_PUBLIC_PAGEURL;

  let userDetails = null;
  if (session?.user?.email) {
    try {
      const response = await fetch(`${pageurl}/api/getdetails/getuserdetails?userEmail=${session.user.email}`);
      if (response.ok) {
        userDetails = await response.json();
      } else {
        console.error('Error fetching user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }

  return {
    props: {
      userDetails,
    },
  };
}

