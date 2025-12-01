import React, { useEffect, useState } from 'react';
import CreateConfessionForm from '@/components/fullPageComps/CreateConfessionForm';
import GuidelinesDialog from '@/components/dialogs/GuidelinesDialog';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from '@/components/componentStyles/createconfessionform.module.css';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/utils/seo';

const CreateConfession = ({ userDetails }) => {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const timeInMinutes = 60; // Set the time threshold in minutes

  useEffect(() => {

    // // Only show once in a while
    // const lastUpdateTime = localStorage.getItem('maddydialogLastUpdateTime');
    // if (!lastUpdateTime) {
    //   setShowDialog(true);
    //   localStorage.setItem('maddydialogLastUpdateTime', Date.now().toString());
    // } else {
    //   const currentTime = Date.now();
    //   const elapsedTime = (currentTime - parseInt(lastUpdateTime)) / (1000 * 60); // Convert milliseconds to minutes
    //   if (elapsedTime >= timeInMinutes) {
    //     setShowDialog(true);
    //     localStorage.setItem('maddydialogLastUpdateTime', currentTime.toString());
    //   }
      
      
    // }
    
    setShowDialog(true);
  }, [userDetails, router]);

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <>
      <div style={{ height: '80%' }}>
        <h1 style={{ fontFamily: 'Jost', fontWeight: '500', marginTop: '2rem',  }} className={styles.mainPageHeading}>Create Confession</h1>
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'hidden', alignItems: 'center', height: '100%' }} className='remcomponents'>
          <CreateConfessionForm userDetails={userDetails} />
          <GuidelinesDialog open={showDialog} onClose={handleCloseDialog} userGender={userDetails.gender}/>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  // Fetch session and user details
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signup',
        permanent: false,
      },
    };
  }

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

export default CreateConfession;

const createConfessionUrl = `${SITE_URL}/create-confession`;

CreateConfession.seo = {
  title: 'Share Your Secret Anonymously | Spyll Confession Form',
  description:
    'Write a confession that only verified Indian students can see. Add a mood, keep your identity private, and publish stories that can trend in campus feeds.',
  keywords: [
    'create anonymous confession',
    'college confession form',
    'share secret online',
    'spyll confession',
    'campus anonymous post',
  ],
  canonicalUrl: createConfessionUrl,
  seoImage: DEFAULT_OG_IMAGE,
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to publish a confession on Spyll',
      description: 'Steps students follow to post an anonymous confession on the Spyll platform.',
      totalTime: 'PT2M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: '0',
      },
      supply: [
        { '@type': 'HowToSupply', name: 'Verified student account' },
        { '@type': 'HowToSupply', name: 'Original confession text' },
      ],
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Open the confession composer',
          text: 'Visit the Create Confession page inside Spyll and agree to the community guidelines popup.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Write your story',
          text: 'Add a headline, pick a mood, and write out your confession using the anonymous editor.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Publish and track responses',
          text: 'Submit the confession to publish instantly and monitor likes or comments from verified peers.',
        },
      ],
      url: createConfessionUrl,
    },
  ],
};
