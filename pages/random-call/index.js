import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession, useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import AudioCallWrapper from '@/components/fullPageComps/AudioCallWrapper';
import UserVerificationDialog from '@/components/chatComps/UserVerificationDialog';
import ExitConfirmationDialog from '@/components/commonComps/ExitConfirmationDialog';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/utils/seo';

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
    // Use push to home instead of back to avoid beforePopState issues
    router.push('/');
  };

  const handleCancelExit = () => {
    setExitDialogOpen(false);
    setAllowNavigation(false);
  };

  const userGender = userDetails?.gender || 'other';

  return (
    <>
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

const randomCallUrl = `${SITE_URL}/random-call`;

AudioCallPage.seo = {
  title: 'Random College Voice Calls | Spyll Audio',
  description:
    'Match into voice calls with real students from Indian campuses, protected by safety prompts, queue visibility, and quick report tools so you can talk freely without sharing your identity.',
  keywords: [
    'college voice call',
    'anonymous audio chat',
    'random call india',
    'student voice rooms',
    'spyll audio',
  ],
  canonicalUrl: randomCallUrl,
  seoImage: DEFAULT_OG_IMAGE,
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Spyll Random Call',
      serviceType: 'Anonymous college voice conversations',
      areaServed: 'IN',
      provider: {
        '@type': 'Organization',
        name: 'Spyll',
        url: SITE_URL,
      },
      url: randomCallUrl,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Conversation filters',
        itemListElement: [
          {
            '@type': 'Offer',
            name: 'Gender preference',
          },
          {
            '@type': 'Offer',
            name: 'Verified college-only queue',
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Random Call',
          item: randomCallUrl,
        },
      ],
    },
  ],
};
