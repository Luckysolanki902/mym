// pages/textchat.js
import React, { useEffect, useRef, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import { getSession } from 'next-auth/react';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './allconfessions.module.css';
import CustomHead from '@/components/seo/CustomHead';
import FilterOptions from '@/components/confessionComps/FilterOptions';
import AuthPrompt from '@/components/commonComps/AuthPrompt';
import ScrollToTop2 from '@/components/commonComps/ScrollToTop2';
import ConfessionSkeleton from '@/components/loadings/ConfessionSkeleton';

const Index = ({ userDetails }) => {
  const [confessions, setConfessions] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ college: 'all', gender: 'any' });
  const sentinelRef = useRef(null);
  const router = useRouter();
  const MAX_CONFESSIONS_USER_CAN_SCROLL_WITHOUT_LOGIN = 20;
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptShown, setAuthPromptShown] = useState(false); // Prevent multiple prompts
  const [limitReached, setLimitReached] = useState(false); // New state to track limit
  const scrollContainerRef = useRef(null); // Create a ref for the scrollable div
  const [activeGender, setActiveGender] = useState('neutral'); // State for background gradient

  useEffect(() => {
    if (userDetails && !userDetails?.isVerified) {
      router.push('/verify/verifyotp');
    }
  }, [userDetails, router]);

  const fetchConfessions = async () => {
    if (limitReached) return; // Prevent fetching if limit is reached

    setLoading(true);
    try {
      const response = await fetch(
        `/api/confession/getdesiredconfessions?college=${filters.college}&gender=${filters.gender}&page=${page}&userCollege=${userDetails?.college}`
      );
      if (response.ok) {
        const data = await response.json();
        const newConfessions = data.confessions;
        if (newConfessions.length === 0) {
          setHasMore(false);
        } else {
          setConfessions(prevConfessions => [...prevConfessions, ...newConfessions]);
          setPage(prevPage => prevPage + 1);

          // Check if limit is reached after fetching
          if (!userDetails && confessions.length + newConfessions.length >= MAX_CONFESSIONS_USER_CAN_SCROLL_WITHOUT_LOGIN) {
            setLimitReached(true);
          }
        }
      } else {
        console.error('Error fetching confessions:', response.status);
      }
    } catch (error) {
      console.error('Error fetching confessions:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Reset state when filters change
    setConfessions([]);
    setPage(1);
    setHasMore(true);
    setAuthPromptShown(false);
    setLimitReached(false); // Reset limit when filters change
    fetchConfessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const handleIntersection = entries => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMore && !loading && page !== 1) {
        if (!userDetails && confessions.length >= MAX_CONFESSIONS_USER_CAN_SCROLL_WITHOUT_LOGIN && !authPromptShown) {
          setShowAuthPrompt(true);
          setAuthPromptShown(true); // Ensure prompt is shown only once
          setLimitReached(true); // Prevent further fetching
        } else if (!limitReached) {
          fetchConfessions();
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.5 });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
      observer.disconnect();
    };
  }, [hasMore, loading, filters, confessions.length, page, authPromptShown, limitReached, userDetails]);

  const handleFiltersChange = newFilters => {
    setFilters(newFilters);
  };

  const getBackgroundGradient = () => {
    switch (activeGender) {
      case 'male':
        return 'linear-gradient(180deg, #e0f7fa 0%, #ffffff 100%)';
      case 'female':
        return 'linear-gradient(180deg, #fce4ec 0%, #ffffff 100%)';
      default:
        return 'linear-gradient(180deg, #fdfbfb 0%, #ebedee 100%)';
    }
  };

  return (
    <>
      <CustomHead title={'Read Confessions from Various Colleges | MYM - Meet Your Mate'} />
      <div
        ref={scrollContainerRef} // Assign the ref to the div
        style={{ 
          width: '100%', 
          paddingTop: '2rem', 
          height: '100vh', 
          overflowY: 'auto',
          background: getBackgroundGradient(),
          transition: 'background 2.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }} // Make the div scrollable
      >
        <div className={styles.chipContainer}>
          <h1 className={styles.mainHeading}>Confessions</h1>
        </div>
        <div className={styles.chipParent}>
          {/* {userDetails && <FilterOptions userDetails={userDetails} onChange={handleFiltersChange} />} */}
        </div>
        {confessions.map(confession => (
          <Confession 
            key={confession._id} 
            confession={confession} 
            userDetails={userDetails} 
            applyGenderBasedGrandients={true} 
            setActiveGender={setActiveGender}
          />
        ))}
        {loading && <ConfessionSkeleton />}
        <div ref={sentinelRef} style={{ height: '10px', background: 'transparent' }}></div>
        {!hasMore && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '3rem',
              marginTop: '0',
            }}
            className={styles.isLoading}
          >
            <p style={{ 
              padding: '1.5rem 2rem', 
              textAlign: 'center', 
              opacity: '0.8', 
              fontWeight: '500',
              fontFamily: 'Quicksand, sans-serif',
              fontSize: '1.1rem',
              color: '#636e72',
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: '2rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              border: '1px solid rgba(255,255,255,0.5)'
            }}>
              That’s the last confession for now... new stories will unfold soon!
            </p>
          </div>
        )}
      </div>
      <ScrollToTop2 scrollContainerRef={scrollContainerRef} />
      <AuthPrompt open={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />
    </>
  );
};

export async function getServerSideProps(context) {
  let session = null;
  session = await getSession(context);

  let userDetails = null;
  if (session?.user?.email) {
    try {
      const pageurl = process.env.NEXT_PUBLIC_PAGEURL;
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

export default Index;
