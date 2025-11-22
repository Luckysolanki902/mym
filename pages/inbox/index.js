// pages/inbox.js
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
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userDetails) {
      router.push('/auth/signup');
    }
    if (userDetails && !userDetails?.isVerified) {
      router.push('/verify/verifyotp');
    }
  }, [userDetails, router]);

  // Updated Function to fetch unseen counts using mid
  const fetchUnseenCounts = async (mid) => {
    try {
      const unseenCountResponse = await fetch(`/api/inbox/unseen-count?mid=${mid}`);

      if (unseenCountResponse.ok) {
        const data = await unseenCountResponse.json();
        const totalCount = (data.totalUnseenCount1 || 0) + (data.totalUnseenCount2 || 0);
        setCount(totalCount);
      } else {
        console.error('Error fetching unseen count:', unseenCountResponse.statusText);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  // Updated Function to fetch data using mid
  const fetchData = async () => {
    if (fetchingData) return; // If already fetching, return early

    setFetchingData(true); // Set fetching state to true

    const session = await getSession();
    const mid = userDetails?.mid;

    if (!mid) {
      console.error('User mid not found');
      setFetchingData(false);
      return;
    }

    try {
      await fetchUnseenCounts(mid);

      const response1 = await fetch(`/api/inbox/get-replies-to-confessions?mid=${mid}`);
      if (response1.ok) {
        const responseData = await response1.json();
        setPersonalRepliesLatest(responseData.personalReplies);
      } else {
        console.error('Error fetching personal replies:', response1.statusText);
      }

      const response2 = await fetch(`/api/inbox/get-replies-to-replies?mid=${mid}`);
      if (response2.ok) {
        const responseData = await response2.json();
        setRepliesToRepliesLatest(responseData.personalReplies);
      } else {
        console.error('Error fetching replies to replies:', response2.statusText);
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

  const userGender = userDetails?.gender || 'male';
  const isMale = userGender === 'male';

  return (
    <div className={`${styles2.inboxWrapper} ${isMale ? styles2.maleTheme : styles2.femaleTheme}`}>
      {/* Floating Action Bar */}
      <div className={styles2.floatingBar}>
        <div className={`${styles2.barContent} ${isMale ? styles2.maleBar : styles2.femaleBar}`}>
          <div className={styles2.titleGroup}>
            <div className={`${styles2.iconBubble} ${isMale ? styles2.maleIcon : styles2.femaleIcon}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <h1 className={`${styles2.mainTitle} ${isMale ? styles2.maleTitle : styles2.femaleTitle}`}>Messages</h1>
              <p className={styles2.subtitle}>{count > 0 ? `${count} unread` : 'All caught up'}</p>
            </div>
          </div>
          <button
            className={`${styles2.refreshBtn} ${isMale ? styles2.maleRefresh : styles2.femaleRefresh}`}
            onClick={() => fetchData()}
            disabled={fetchingData}
          >
            {fetchingData ? (
              <CircularProgress size={18} style={{ color: 'inherit' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className={styles2.filterSection}>
        <button
          className={`${styles2.filterPill} ${tabIndex === 0 ? (isMale ? styles2.filterActiveMale : styles2.filterActiveFemale) : ''}`}
          onClick={(e) => handleTabChange(e, 0)}
        >
          <span className={styles2.pillIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
          <span>Confessions</span>
          {personalRepliesLatest?.length > 0 && (
            <span className={`${styles2.pillBadge} ${isMale ? styles2.maleBadge : styles2.femaleBadge}`}>{personalRepliesLatest.length}</span>
          )}
        </button>
        <button
          className={`${styles2.filterPill} ${tabIndex === 1 ? (isMale ? styles2.filterActiveMale : styles2.filterActiveFemale) : ''}`}
          onClick={(e) => handleTabChange(e, 1)}
        >
          <span className={styles2.pillIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </span>
          <span>Your Replies</span>
          {repliesToRepliesLatest?.length > 0 && (
            <span className={`${styles2.pillBadge} ${isMale ? styles2.maleBadge : styles2.femaleBadge}`}>{repliesToRepliesLatest.length}</span>
          )}
        </button>
      </div>

      {/* Messages Grid */}
      <div className={styles2.messagesContainer}>
        {tabIndex === 0 && (
          <>
            {personalRepliesLatest?.length > 0 ? (
              <div className={styles2.masonryGrid}>
                {personalRepliesLatest.map((entry, index) => (
                  <div 
                    key={`${entry._id}${index}`} 
                    className={styles2.masonryItem}
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <InboxCard entry={entry} userDetails={userDetails} />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles2.emptyView}>
                <div className={styles2.emptyContent}>
                  <div className={styles2.emptyIllustration}>
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <h3 className={styles2.emptyHeading}>No replies yet</h3>
                  <p className={styles2.emptyDescription}>
                    When someone replies to your confessions, they'll show up here
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        {tabIndex === 1 && (
          <>
            {repliesToRepliesLatest?.length > 0 ? (
              <div className={styles2.masonryGrid}>
                {repliesToRepliesLatest.map((entry, index) => (
                  <div 
                    key={`${entry._id}${index}`} 
                    className={styles2.masonryItem}
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <InboxCard2 entry={entry} userDetails={userDetails} />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles2.emptyView}>
                <div className={styles2.emptyContent}>
                  <div className={styles2.emptyIllustration}>
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      <path d="M8 10h.01M12 10h.01M16 10h.01"/>
                    </svg>
                  </div>
                  <h3 className={styles2.emptyHeading}>Start a conversation</h3>
                  <p className={styles2.emptyDescription}>
                    Replies to your messages will appear here
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = process.env.NEXT_PUBLIC_PAGEURL;

  let personalReplies = {};
  let repliesToReplies = {};
  let userDetails = null;
  let mid = null;

  if (session) {
    const email = session?.user?.email;
    if (email) {
      try {
        const response = await fetch(`${pageurl}/api/getdetails/getuserdetails?userEmail=${encodeURIComponent(session.user.email)}`);
        if (response.ok) {
          userDetails = await response.json();
          mid = userDetails?.mid;
        } else {
          console.error('Error fetching user details:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }

      if (mid) {
        try {
          const response1 = await fetch(`${pageurl}/api/inbox/get-replies-to-confessions?mid=${mid}`);
          if (response1.ok) {
            personalReplies = await response1.json();
          } else {
            console.error('Error fetching personal replies:', response1.statusText);
          }
        } catch (error) {
          console.error('Error fetching personal replies:', error);
        }

        try {
          const response2 = await fetch(`${pageurl}/api/inbox/get-replies-to-replies?mid=${mid}`);
          if (response2.ok) {
            repliesToReplies = await response2.json();
          } else {
            console.error('Error fetching replies to replies:', response2.statusText);
          }
        } catch (error) {
          console.error('Error fetching replies to replies:', error);
        }
      }
    }
  } else {
    // Handle unauthenticated user if necessary
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
