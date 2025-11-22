// pages/textchat.js
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession, useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import CustomHead from '@/components/seo/CustomHead';
import TextChatWrapper from '@/components/fullPageComps/TextChatWrapper';
import UserVerificationDialog from '@/components/chatComps/UserVerificationDialog';
import ExitConfirmationDialog from '@/components/commonComps/ExitConfirmationDialog';

const TextChatPage = ({ userDetails }) => {
  const bottomRef = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();
  const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);
  
  // State to control the visibility of the exit confirmation dialog
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  
  // State to determine if navigation is allowed (to prevent infinite loops)
  const [allowNavigation, setAllowNavigation] = useState(false);

  /**
   * Scrolls to the bottom of the chat when the component mounts.
   */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  /**
   * Handles redirection based on session and unverified user details.
   * Currently, no redirection is performed as the dialog manages verification.
   */
  useEffect(() => {
    if (!session && !unverifiedUserDetails.mid) {
      // Access is allowed without sign-in if unverifiedUserDetails exists
      // No redirection needed as the dialog handles verification
    }
  }, [session, unverifiedUserDetails]);

  /**
   * Sets up Next.js's router.beforePopState to intercept back navigation.
   */
  useEffect(() => {
    const handleBeforePopState = ({ url, as, options }) => {
      if (!allowNavigation) {
        setExitDialogOpen(true);
        // Prevent navigation by returning false
        return false;
      }
      // Allow navigation
      return true;
    };

    router.beforePopState(handleBeforePopState);

    return () => {
      router.beforePopState(() => true);
    };
  }, [allowNavigation, router]);

  /**
   * Handles the user's confirmation to exit the chat.
   * Allows navigation by setting allowNavigation to true and triggering router.back().
   */
  const handleConfirmExit = () => {
    setExitDialogOpen(false);
    setAllowNavigation(true);
    router.back();
  };

  /**
   * Handles the user's cancellation of the exit action.
   * Keeps the user on the current page by not allowing navigation.
   */
  const handleCancelExit = () => {
    setExitDialogOpen(false);
    setAllowNavigation(false);
  };

  // Determine the user's gender for button styling; defaults to 'other' if undefined
  const userGender = userDetails?.gender || 'other';

  return (
    <>
      {/* SEO Component */}
      <CustomHead
        title="Chat Anonymously With Your College Peers | MyM"
        description="Experience the buzz of anonymous chatting with MyM TextChat! Say goodbye to the usual small talk and dive into genuine conversations with your fellow college mates. It's like Omegle, but exclusive to your campus. Filter your matches by gender, college, and more, ensuring every chat is tailored to your preferences. Unveil the excitement of anonymous connections, share stories, and forge bonds—all within the safe confines of your college community. Join MyM TextChat today and let the conversations begin!"
      />

      {/* User Verification Dialog */}
      <UserVerificationDialog />

      {/* Main Chat Wrapper */}
      <TextChatWrapper userDetails={userDetails} />

      {/* Reference Div for Scrolling */}
      <div ref={bottomRef}></div>

      {/* Exit Confirmation Dialog */}
      <ExitConfirmationDialog
        open={exitDialogOpen}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        userGender={userGender}
      />
    </>
  );
};

/**
 * Fetches user details server-side based on the session.
 */
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
