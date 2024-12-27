import React, { useEffect, useState } from 'react';
import TextChat from '@/components/chatComps/TextChat';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { TextChatProvider } from '@/context/TextChatContext';
import { FiltersProvider } from '@/context/FiltersContext';
import { CircularProgress, Typography, Box } from '@mui/material';

const TextChatWrapper = ({ userDetails }) => {
  const { data: session } = useSession();
  const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);

  const [isUserDetailsComplete, setIsUserDetailsComplete] = useState(false);
  const [effectiveUserDetails, setEffectiveUserDetails] = useState(null);

  useEffect(() => {
    // Check if we have either valid userDetails (from server) OR unverifiedUserDetails (from Redux)
    const detailsComplete =
      (userDetails && Object.keys(userDetails).length > 0) ||
      (unverifiedUserDetails.gender && unverifiedUserDetails.college && unverifiedUserDetails.mid);

    setIsUserDetailsComplete(detailsComplete);

    // Decide which set of details to use for the chat
    const userDetailsToUse =
      userDetails && Object.keys(userDetails).length > 0
        ? userDetails
        : unverifiedUserDetails;

    setEffectiveUserDetails(userDetailsToUse);

  }, [session, userDetails, unverifiedUserDetails]);

  return (
    <FiltersProvider>
      <TextChatProvider>
        {isUserDetailsComplete ? (
          <TextChat userDetails={effectiveUserDetails} />
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="100vh"
          >
            <Typography variant="body1" fontFamily={'Jost'} gutterBottom>
              Preparing your chat experience...
            </Typography>
            {/* <CircularProgress /> */}
          </Box>
        )}
      </TextChatProvider>
    </FiltersProvider>
  );
};

export default TextChatWrapper;
