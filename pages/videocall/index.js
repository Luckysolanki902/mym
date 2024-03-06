// pages/audiocall.js
import AudioCall from '@/components/fullPageComps/AudioCall';
import VideoCall from '@/components/fullPageComps/VideoCall';
import { getSession } from 'next-auth/react';
import React, { useEffect } from 'react';

const VideoCallPage = ({ userDetails }) => {

  return (
    <div>
      <VideoCall userDetails={userDetails} />
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = 'https://www.meetyourmate.in';

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

export default VideoCallPage;
