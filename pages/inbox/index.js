import React, { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { Typography, Card, CardContent, Divider, Tabs, Tab, Button, CircularProgress } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import InboxCard from '@/components/confessionComps/InboxCard';
import InboxCard2 from '@/components/confessionComps/InboxCard2';
import styles from '@/components/componentStyles/inboxStyles.module.css';
import styles2 from './styles/inbox.module.css';
import RefreshIcon from '@mui/icons-material/Refresh';

const InboxPage = ({ personalReplies, userDetails, repliesToReplies }) => {
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0);
  const [personalRepliesLatest, setPersonalRepliesLatest] = useState(personalReplies?.personalReplies || []);
  const [repliesToRepliesLatest, setRepliesToRepliesLatest] = useState(repliesToReplies?.personalReplies || []);
  const [fetchingData, setFetchingData] = useState(false); // State to track fetching status
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!userDetails) {
      router.push('/auth/signup');
    }
    if (userDetails && !userDetails?.isVerified) {
      router.push('/verify/verifyotp');
    }
  }, [userDetails, router]);

  // Interval for fetching data every 15 seconds
  const fetchData = async () => {
    if (fetchingData) return; // If already fetching, return early

    setFetchingData(true); // Set fetching state to true

    const session = await getSession();
    const email = session?.user?.email;
    let mid = userDetails?.mid;

    const fetchUnseenCounts = async (email) => {
      try {
        const unseenCountResponse = await fetch(`/api/inbox/unseen-count?email=${email}`);
    
        if (unseenCountResponse.ok) {
          const data = await unseenCountResponse.json();
          const totalCount = data.totalUnseenCount1 + data.totalUnseenCount2;
          setCount(totalCount); // Assuming setCount is a state updater function in React or similar
        } else {
          console.error('Error fetching unseen count:', unseenCountResponse.statusText);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    try {
  
      await fetchUnseenCounts(email);

      const response1 = await fetch(`/api/inbox/get-replies-to-confessions?mid=${mid}`);
      if (response1.ok) {
        const responseData = await response1.json();
        setPersonalRepliesLatest(responseData.personalReplies);
      } else {
        console.log('Error fetching replies:', response1.statusText);
      }

      const response2 = await fetch(`/api/inbox/get-replies-to-replies?mid=${mid}`);
      if (response2.ok) {
        const responseData = await response2.json();
        setRepliesToRepliesLatest(responseData.personalReplies);
      } else {
        console.log('Error fetching replies to replies:', response2.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setFetchingData(false); // Reset fetching state
    }
  };


  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
    fetchData();
  };



  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      <Button style={{ position: 'fixed', right: '1rem', backgroundColor: 'white', color: 'black', zIndex: '19' }} variant='contained' onClick={() => fetchData()}>
        <span style={{ marginRight: '0.5rem' }}>Refresh</span>
        {/* mui refresh icon */}
        {fetchingData ? <CircularProgress size={20} /> : <RefreshIcon />}
      </Button>
      <div style={{}}>
        <h1 className={styles.h1} style={{ marginLeft: "1rem", display: 'flex', alignItems: 'center' }}>Inbox <span>({count})</span></h1>

      </div>

      <Tabs value={tabIndex} onChange={handleTabChange} centered style={{ marginBottom: "4rem" }}>
        <Tab style={{ maxWidth: '170px' }} label="Replies to Your Confessions" />
        <Tab style={{ maxWidth: '170px' }} label="Replies to Your Replies" />
      </Tabs>
      {tabIndex === 0 && (
        <div>
          {personalRepliesLatest?.length > 0 ? (
            personalRepliesLatest.map((entry, index) => (
              <div key={`${entry._id}${index}`} style={{ marginBottom: '5rem' }}>
                <InboxCard style={{ marginBottom: '4.5rem' }} entry={entry} userDetails={userDetails} />
              </div>
            ))
          ) : (
            <div className={styles2.msgIllustration}>
              <Image src={'/images/illustrations/replies.png'} width={960} height={695} alt="start chat" />
              <div>
                <span>Replies</span> to your <span>confessions</span> will appear here
              </div>
            </div>
          )}
        </div>
      )}
      {tabIndex === 1 && (
        <div>
          {repliesToRepliesLatest?.length > 0 ? (
            repliesToRepliesLatest.map((entry, index) => (
              <div key={`${entry._id}${index}`} style={{ marginBottom: '5rem' }}>
                <InboxCard2 style={{ marginBottom: '4.5rem' }} entry={entry} userDetails={userDetails} />
              </div>
            ))
          ) : (
            <div className={styles2.msgIllustration}>
              <Image src={'/images/illustrations/replies.png'} width={960} height={695} alt="start chat" />
              <div>
                <span>Replies</span> to your <span>replies</span> will appear here
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = 'http://localhost:3000';
  // const pageurl = 'https://www.meetyourmate.in';

  let personalReplies = {};
  let repliesToReplies = {};
  let userDetails = null;
  let mid = null;


  if (session) {
    const email = session?.user?.email;
    if (email) {
      try {
        const response = await fetch(`${pageurl}/api/getdetails/getuserdetails?userEmail=${session.user.email}`);
        if (response.ok) {
          userDetails = await response.json();
          mid = userDetails?.mid;
        } else {
          console.error('Error fetching user details');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }

      try {
        const response = await fetch(`${pageurl}/api/inbox/get-replies-to-confessions?mid=${mid}`);
        if (response.ok) {
          personalReplies = await response.json();
        } else {
          console.log('Error fetching replies:', response.statusText);
        }
      } catch (error) {
        console.log('Error fetching replies:', error);
      }

      try {
        const response = await fetch(`${pageurl}/api/inbox/get-replies-to-replies?mid=${mid}`);
        if (response.ok) {
          repliesToReplies = await response.json();
        } else {
          console.log('Error fetching replies to replies:', response.statusText);
        }
      } catch (error) {
        console.log('Error fetching replies to replies:', error);
      }
    }
  }

  return {
    props: {
      personalReplies,
      userDetails,
      repliesToReplies,
    },
  };
}

export default InboxPage;
