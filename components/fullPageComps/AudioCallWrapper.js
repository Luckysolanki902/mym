import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { FiltersProvider } from '@/context/FiltersContext';
import { AudioCallProvider } from '@/context/AudioCallContext';
import AudioCallLayout from '@/components/audioCall/AudioCallLayout';
import { Box, Typography } from '@mui/material';

const AudioCallWrapper = ({ userDetails }) => {
  const { data: session } = useSession();
  const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);

  const [effectiveUserDetails, setEffectiveUserDetails] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hasServerDetails = userDetails && Object.keys(userDetails).length > 0;
    const hasUnverifiedDetails =
      unverifiedUserDetails?.gender && unverifiedUserDetails?.college && unverifiedUserDetails?.mid;

    const details = hasServerDetails ? userDetails : hasUnverifiedDetails ? unverifiedUserDetails : null;
    setEffectiveUserDetails(details);
    setIsReady(Boolean(details));
  }, [session, userDetails, unverifiedUserDetails]);

  return (
    <FiltersProvider>
      <AudioCallProvider>
        {isReady ? (
          <AudioCallLayout userDetails={effectiveUserDetails} />
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="100vh"
          >
            <Typography variant="body1" fontFamily={'Jost'} gutterBottom>
              Prepping your audio experience...
            </Typography>
          </Box>
        )}
      </AudioCallProvider>
    </FiltersProvider>
  );
};

export default AudioCallWrapper;
