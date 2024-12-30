// pages/textchat.js
import TextChatWrapper from '@/components/fullPageComps/TextChatWrapper';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import CustomHead from '@/components/seo/CustomHead';
import UserVerificationDialog from '@/components/chatComps/UserVerificationDialog';
import { useSelector } from 'react-redux';

const TextChatPage = ({ userDetails }) => {
  const bottomRef = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();
  const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);
  
  const [isBlocking, setIsBlocking] = useState(true); // Assume blocking by default
  const [showConfirm, setShowConfirm] = useState(false);
  const [nextRoute, setNextRoute] = useState(null);

  useEffect(() => {
    // Scroll to the bottom when the component mounts
    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Redirect logic can be handled within the dialog
    if (!session && !unverifiedUserDetails.mid) {
      // Allow access without sign in if unverifiedUserDetails exists
      // No redirection needed as dialog handles verification
    }
  }, [userDetails, router, session, unverifiedUserDetails]);

  // Handle browser refresh and tab close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isBlocking) {
        e.preventDefault();
        e.returnValue = 'All your chats will be lost if you leave this page.';
        return 'All your chats will be lost if you leave this page.';
      }
      return undefined;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isBlocking]);

  // Handle client-side navigation
  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      if (isBlocking && url !== router.asPath) {
        // Show custom confirmation dialog
        setShowConfirm(true);
        setNextRoute(url);
        // Prevent the route change
        router.events.emit('routeChangeError');
        throw 'Route change aborted.';
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [isBlocking, router]);

  // Handle user confirmation
  const handleConfirmLeave = () => {
    setIsBlocking(false);
    setShowConfirm(false);
    if (nextRoute) {
      router.push(nextRoute);
    }
  };

  const handleCancelLeave = () => {
    setShowConfirm(false);
    setNextRoute(null);
  };

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

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl mb-4">Confirm Navigation</h2>
            <p>All your chats will be lost if you leave this page. Are you sure you want to proceed?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleCancelLeave}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeave}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
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
