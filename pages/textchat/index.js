// pages/textchat.js
import TextChatWrapper from '@/components/fullPageComps/TextChatWrapper';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import CustomHead from '@/components/seo/CustomHead';
import UserVerificationDialog from '@/components/chatComps/UserVerificationDialog';
import { useSelector } from 'react-redux';

const TextChatPage = ({ userDetails }) => {
  const bottomRef = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();
  const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);

  useEffect(() => {
    // Scroll to the bottom when the component mounts
    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Redirect logic can be handled within the dialog
    // if (userDetails && !userDetails.isVerified) {
    //   router.push('/verify/verifyotp');
    // }
    if (!session && !unverifiedUserDetails.mid) {
      // Allow access without sign in if unverifiedUserDetails exists
      // No redirection needed as dialog handles verification
    }
  }, [userDetails, router, session, unverifiedUserDetails]);

  return (
    <>
      <CustomHead
        title={'Chat Anonymously With Your College Peers | MyM'}
        description={
          "Experience the buzz of anonymous chatting with MyM TextChat! Say goodbye to the usual small talk and dive into genuine conversations with your fellow college mates. It's like Omegle, but exclusive to your campus. Filter your matches by gender, college, and more, ensuring every chat is tailored to your preferences. Unveil the excitement of anonymous connections, share stories, and forge bonds—all within the safe confines of your college community. Join MyM TextChat today and let the conversations begin!"
        }
      />
      <UserVerificationDialog />
      <TextChatWrapper userDetails={userDetails} />
      <div ref={bottomRef}></div>
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
