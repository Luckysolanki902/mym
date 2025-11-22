import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession, useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import CustomHead from '@/components/seo/CustomHead';
import AudioCallWrapper from '@/components/fullPageComps/AudioCallWrapper';
import UserVerificationDialog from '@/components/chatComps/UserVerificationDialog';
import ExitConfirmationDialog from '@/components/commonComps/ExitConfirmationDialog';

const AudioCallPage = ({ userDetails }) => {
  const bottomRef = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();
  const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);

  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (!session && !unverifiedUserDetails.mid) {
      // Dialog manages verification for audio call as well
    }
  }, [session, unverifiedUserDetails]);

  useEffect(() => {
    const handleBeforePopState = () => {
      if (!allowNavigation) {
        setExitDialogOpen(true);
        return false;
      }
      return true;
    };

    router.beforePopState(handleBeforePopState);
    return () => router.beforePopState(() => true);
  }, [allowNavigation, router]);

  const handleConfirmExit = () => {
    setExitDialogOpen(false);
    setAllowNavigation(true);
    router.back();
  };

  const handleCancelExit = () => {
    setExitDialogOpen(false);
    setAllowNavigation(false);
  };

  const userGender = userDetails?.gender || 'other';

  return (
    <>
      <CustomHead
        title="Discover Real Voices From Your Campus | MyM Audio"
        description="Hop into spontaneous audio conversations with verified students from your college network. Our queue keeps things fair, while filters ensure you meet people who match your vibe."
      />
      <UserVerificationDialog mode="audiocall" />
      <AudioCallWrapper userDetails={userDetails} />
      <div ref={bottomRef} />
      <ExitConfirmationDialog
        open={exitDialogOpen}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        userGender={userGender}
      />
    </>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = process.env.NEXT_PUBLIC_PAGEURL;

  let userDetails = null;
  if (session?.user?.email) {
    try {
      const response = await fetch(`${pageurl}/api/getdetails/getuserdetails?userEmail=${session.user.email}`);
      if (response.ok) {
        userDetails = await response.json();
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

export default AudioCallPage;
