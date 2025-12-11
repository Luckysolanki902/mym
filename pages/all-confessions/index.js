// pages/textchat.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from './allconfessions.module.css';
import AuthPrompt from '@/components/commonComps/AuthPrompt';
import ScrollToTop2 from '@/components/commonComps/ScrollToTop2';
import ConfessionSkeleton from '@/components/loadings/ConfessionSkeleton';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/utils/seo';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsTourCompleted, startTour } from '@/store/slices/onboardingSlice';
import OnboardingTour from '@/components/commonComps/OnboardingTour';
import { confessionsTourSteps } from '@/config/tourSteps';

const Index = ({ userDetails }) => {
  const [confessions, setConfessions] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters] = useState({ college: 'all', gender: 'any' });
  const [sortBy, setSortBy] = useState('new'); // 'trending' or 'new'
  const [myCollegeOnly, setMyCollegeOnly] = useState(false); // Independent toggle
  const sentinelRef = useRef(null);
  const router = useRouter();
  const MAX_CONFESSIONS_USER_CAN_SCROLL_WITHOUT_LOGIN = 20;
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptShown, setAuthPromptShown] = useState(false); // Prevent multiple prompts
  const [limitReached, setLimitReached] = useState(false); // New state to track limit
  const scrollContainerRef = useRef(null); // Create a ref for the scrollable div
  const [activeGender, setActiveGender] = useState('neutral'); // State for background gradient
  const nextPageRef = useRef(1);
  const confessionCountRef = useRef(0);
  const tourShownRef = useRef(false); // Track if tour was shown this session

  // Tour state
  const dispatch = useDispatch();
  const isTourCompleted = useSelector(selectIsTourCompleted('allConfessions'));

  // Show tour for first-time visitors after confessions load (only once per session)
  useEffect(() => {
    if (!tourShownRef.current && !isTourCompleted && confessions.length > 0 && !loading) {
      tourShownRef.current = true; // Mark as shown for this session
      const timer = setTimeout(() => {
        dispatch(startTour('allConfessions'));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTourCompleted, confessions.length, loading, dispatch]);

  useEffect(() => {
    if (userDetails && !userDetails?.isVerified) {
      router.push('/verify/verifyotp');
    }
  }, [userDetails, router]);

  useEffect(() => {
    if (userDetails) {
      setLimitReached(false);
      setAuthPromptShown(false);
    }
  }, [userDetails]);

  const fetchConfessions = useCallback(
    async ({ targetPage, reset = false } = {}) => {
      if (limitReached && !reset) return;

      const pageToFetch = targetPage ?? nextPageRef.current;

      if (reset) {
        setConfessions([]);
        setHasMore(true);
        setAuthPromptShown(false);
        setLimitReached(false);
        confessionCountRef.current = 0;
        nextPageRef.current = 1;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          college: filters.college || 'all',
          gender: filters.gender,
          page: String(pageToFetch),
          userCollege: userDetails?.college || '',
          sortBy,
          myCollegeOnly: myCollegeOnly ? 'true' : 'false',
        });

        const response = await fetch(`/api/confession/getdesiredconfessions?${params.toString()}`);
        if (!response.ok) {
          console.error('Error fetching confessions:', response.status);
          return;
        }

        const data = await response.json();
        const newConfessions = data.confessions || [];

        setConfessions(prevConfessions => (reset ? newConfessions : [...prevConfessions, ...newConfessions]));

        if (newConfessions.length === 0) {
          setHasMore(false);
        }

        confessionCountRef.current += newConfessions.length;
        nextPageRef.current = pageToFetch + 1;

        if (!userDetails && confessionCountRef.current >= MAX_CONFESSIONS_USER_CAN_SCROLL_WITHOUT_LOGIN) {
          setLimitReached(true);
        }
      } catch (error) {
        console.error('Error fetching confessions:', error);
      } finally {
        setLoading(false);
      }
    },
    [limitReached, sortBy, myCollegeOnly, filters.college, filters.gender, userDetails?.college, userDetails, MAX_CONFESSIONS_USER_CAN_SCROLL_WITHOUT_LOGIN]
  );

  useEffect(() => {
    fetchConfessions({ targetPage: 1, reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, myCollegeOnly]);

  useEffect(() => {
    const handleIntersection = entries => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMore && !loading && nextPageRef.current !== 1) {
        if (!userDetails && limitReached) {
          if (!authPromptShown) {
            setShowAuthPrompt(true);
            setAuthPromptShown(true);
          }
          return;
        }

        if (!limitReached) {
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
  }, [hasMore, loading, authPromptShown, limitReached, userDetails, fetchConfessions]);

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
        <div className={styles.tabsContainer} data-tour="sort-tabs">
          <div className={styles.sortGroup}>
            <div 
              className={`${styles.tab} ${sortBy === 'trending' ? styles.activeTab : ''}`}
              onClick={() => setSortBy('trending')}
            >
              Trending
            </div>
            <div 
              className={`${styles.tab} ${sortBy === 'new' ? styles.activeTab : ''}`}
              onClick={() => setSortBy('new')}
            >
              New
            </div>
          </div>
          {userDetails && (
            <>
              <div className={styles.divider} />
              <div 
                className={`${styles.collegeToggle} ${myCollegeOnly ? styles.collegeToggleActive : ''}`}
                onClick={() => setMyCollegeOnly(!myCollegeOnly)}
              >
                My College
              </div>
            </>
          )}
        </div>
        <div className={styles.chipParent}></div>
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
             { loading ? '' :`That’s the last confession for now... new stories will unfold soon!`}
            </p>
          </div>
        )}
      </div>
      <ScrollToTop2 scrollContainerRef={scrollContainerRef} />
      <AuthPrompt open={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />
      
      {/* Onboarding Tour */}
      <OnboardingTour
        tourName="allConfessions"
        steps={confessionsTourSteps}
      />
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

const confessionsUrl = `${SITE_URL}/all-confessions`;

Index.seo = {
  title: 'College Confessions Wall | Spyll',
  description:
    'Browse trending and recent anonymous confessions from verified Indian campuses. Filter by college or gender, react safely, and see what your peers are really talking about.',
  keywords: [
    'college confessions india',
    'anonymous campus stories',
    'student confession wall',
    'hbtu confessions',
    'spyll stories',
  ],
  canonicalUrl: confessionsUrl,
  seoImage: DEFAULT_OG_IMAGE,
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Spyll Confessions',
      url: confessionsUrl,
      about: {
        '@type': 'Thing',
        name: 'Anonymous college confessions',
      },
      isPartOf: { '@id': `${SITE_URL}/#website` },
      inLanguage: 'en-IN',
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
          name: 'Confessions',
          item: confessionsUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Latest Confessions',
      url: confessionsUrl,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          url: confessionsUrl,
          name: 'Anonymous confession stream',
        },
      ],
    },
  ],
};
