import React, { useEffect, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './confession.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsTourCompleted, completeTour } from '@/store/slices/onboardingSlice';
import OnboardingTour from '@/components/commonComps/OnboardingTour';
import { confessionDetailTourSteps } from '@/config/tourSteps';

const ConfessionPage = ({ confession, userDetails }) => {
  const confessionGender = confession?.gender || 'neutral';
  
  // Tour state
  const dispatch = useDispatch();
  const isTourCompleted = useSelector(selectIsTourCompleted('confessionDetail'));
  const [showTour, setShowTour] = useState(false);
  const isDebugMode = process.env.NEXT_PUBLIC_NODE_ENV === 'debug';

  // Show tour for first-time visitors (always show in debug mode)
  useEffect(() => {
    if ((isDebugMode || !isTourCompleted) && confession) {
      const timer = setTimeout(() => setShowTour(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isTourCompleted, confession, isDebugMode]);

  const handleTourComplete = () => {
    setShowTour(false);
    dispatch(completeTour('confessionDetail'));
  };
  
  return (
    <div className={`${styles.confessionPageWrapper} ${
      confessionGender === 'male' ? styles.maleTheme : 
      confessionGender === 'female' ? styles.femaleTheme : 
      styles.neutralTheme
    }`}>
      {confession && <Confession confession={confession} userDetails={userDetails || null} applyGenderBasedGrandients={true}/>}
      <div className={styles.linkContainer}>
        <Link className={`${styles.allConfessionsLink} ${
          confessionGender === 'male' ? styles.maleLink : 
          confessionGender === 'female' ? styles.femaleLink : 
          styles.neutralLink
        }`} href={'/all-confessions'}>
          View all confessions →
        </Link>
      </div>

      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour
          steps={confessionDetailTourSteps}
          onComplete={handleTourComplete}
          tourId="confessionDetail"
        />
      )}
    </div>
  );
};

export async function getServerSideProps(context) {
  const { params } = context;
  const { confessionid } = params;

  // Fetch session and user details
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

  // Fetch confession details
  let confession = null;
  try {
    const response = await fetch(`${pageurl}/api/confession/getconfessionbyid/${confessionid}`);
    if (response.ok) {
      confession = await response.json();
    } else {
      console.error('Error fetching confession details');
    }
  } catch (error) {
    console.error('Error fetching confession details:', error);
  }

  return {
    props: {
      confession,
      userDetails,
    },
  };
}

export default ConfessionPage;
