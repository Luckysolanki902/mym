// pages/textchat.js
import TextChat from '@/components/fullPageComps/TextChat';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import CustomHead from '@/components/seo/CustomHead';
const TextChatPage = ({ userDetails }) => {
  const bottomRef = useRef(null);
  const router = useRouter()
  useEffect(() => {
    // Scroll to the bottom when the component mounts
    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);


  const { data: session } = useSession();
  useEffect(() => {
    // Redirect to verify/verifyotp if userDetails is not verified
    if (userDetails && !userDetails.isVerified) {
      router.push('/verify/verifyotp');
    }
    if (!session) {
      router.push('/auth/signup');
    }
  }, [userDetails, router]);
  return (
    <>
      <CustomHead title={'Connect Anonymously: Chat with Your College Peers | MyM TextChat'} description={"Experience the buzz of anonymous chatting with MyM TextChat! Say goodbye to the usual small talk and dive into genuine conversations with your fellow college mates. It's like Omegle, but exclusive to your campus. Filter your matches by gender, college, and more, ensuring every chat is tailored to your preferences. Unveil the excitement of anonymous connections, share stories, and forge bonds—all within the safe confines of your college community. Join MyM TextChat today and let the conversations begin!"}/>
      <TextChat userDetails={userDetails} />
      <div ref={bottomRef}></div>
    </>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = process.env.NEXT_PUBLIC_PAGEURL;

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
