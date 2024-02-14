// pages/textchat.js
import VideoChat from '@/components/fullPageComps/VideoChat';
import { getSession } from 'next-auth/react';

const TextChatPage = ({ userDetails }) => {
  return (
    <>
      <VideoChat userDetails={userDetails} />
    </>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = 'https://www.meetyourmate.in'

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

  // Fetch other necessary data like preferredCollege and preferredGender

  return {
    props: {
      userDetails,
    },
  };
}

export default TextChatPage;
