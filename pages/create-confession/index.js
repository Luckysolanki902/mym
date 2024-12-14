import React, { useEffect, useState } from 'react';
import CreateConfessionForm from '@/components/fullPageComps/CreateConfessionForm';
import GuidelinesDialog from '@/components/dialogs/GuidelinesDialog';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import CustomHead from '@/components/seo/CustomHead';
import styles from '@/components/componentStyles/createconfessionform.module.css';

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
      <CustomHead title={'Share Your Secrets Anonymously | Create Confession | MyM'} description={"Ready to unload your thoughts? Create your confession anonymously on MyM and join a community of secret-sharers. No judgments, no worries—just pure anonymity. Pour your heart out, get it off your chest, and experience the liberating feeling of unburdening yourself. Plus, get more likes and comments to make your confession trend and spark conversations. Start sharing your secrets today with MyM's Create Confession feature."} keywords={ ['share secrets anonymously', 'confession creation', 'anonymous sharing', 'college confessions', 'unburden yourself', 'confession community', 'secret sharing platform', 'trending confessions']}/>
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
