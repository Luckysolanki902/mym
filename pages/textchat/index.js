// pages/textchat.js
import TextChat from '@/components/fullPageComps/TextChat';
import { getSession } from 'next-auth/react';
import React, { useEffect, useRef } from 'react';

const TextChatPage = ({ userDetails }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom when the component mounts
    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);
  return (
    <>
      <TextChat userDetails={userDetails} />
      <div ref={bottomRef}></div>
    </>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = 'https://www.meetyourmate.in'

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

export default TextChatPage;
