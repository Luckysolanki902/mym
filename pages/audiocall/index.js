// pages/audiocall.js
import AudioCall from '@/components/fullPageComps/AudioCall';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const AudioCallPage = ({ userDetails }) => {
const router = useRouter();
useEffect(() => {
  // Redirect to verify/verifyotp if userDetails is not verified
  if (userDetails && !userDetails.isVerified) {
    router.push('/verify/verifyotp');
  }
}, [userDetails]);
  return (
    <div>
      <AudioCall userDetails={userDetails} />
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = 'https://www.meetyourmate.in';

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signup',
        permanent: false,
      },
    };
  }

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

export default AudioCallPage;
