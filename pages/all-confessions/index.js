import React, { useEffect, useRef, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import { getSession } from 'next-auth/react';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './allconfessions.module.css';
import CustomHead from '@/components/seo/CustomHead';
import FilterOptions from '@/components/confessionComps/FilterOptions';

const Index = ({ userDetails, initialConfessions }) => {
  const [confessions, setConfessions] = useState(initialConfessions);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false); // Add loading state
  const [filters, setFilters] = useState({ college: 'all', gender: '' }); // Add filters state
  const sentinelRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect to verify/verifyotp if userDetails is not verified
    if (userDetails && !userDetails?.isVerified) {
      router.push('/verify/verifyotp');
    }
  }, [userDetails, router]);

  const fetchMoreConfessions = async () => {
    console.log('fetching more...');
    setLoading(true); // Set loading to true while fetching
    const response = await fetch(`/api/confession/getdesiredconfessions?college=${filters.college}&gender=${filters.gender}&page=${page + 1}&userCollege=${userDetails?.college}`);
    if (response.ok) {
      const newConfessionsData = await response.json();
      const newConfessions = newConfessionsData.confessions;
      if (newConfessions.length === 0) {
        setHasMore(false); // No more confessions available
      } else {
        setConfessions(prevConfessions => [...prevConfessions, ...newConfessions]);
        setPage(prevPage => prevPage + 1);
      }
    } else {
      console.error('Error fetching more confessions');
    }
    setLoading(false); // Set loading to false after fetching
  };

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) { // Add loading condition
        fetchMoreConfessions();
      }
    }, { threshold: 0.5 }); // Adjust the threshold as needed

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading]); // Make sure to run the effect when `hasMore` or `loading` changes

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setConfessions([]); // Clear existing confessions
    setPage(1); // Reset page
    setHasMore(true); // Reset hasMore
  };

  useEffect(() => {
    // Fetch new confessions when filters change
    fetchMoreConfessions();
  }, [filters]);

  return (
    <>
      <CustomHead title={'Read Confessions of your College | MYM'} />
      <div style={{ width: '100%', paddingTop: '2rem' }}>
        <div className={styles.chipContainer}>
          <h1 className={styles.mainHeading}>Confessions</h1>
        </div>
        <div className={styles.chipParent}>
          {userDetails && <FilterOptions userDetails={userDetails} onChange={handleFiltersChange} />}
        </div>
        {confessions.map((confession, index) => (
          <Confession key={confession._id} confession={confession} userDetails={userDetails} applyGenderBasedGrandients={true} />
        ))}
        {loading &&
          <div style={{ width: '1oo%', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '3rem', marginTop: '0', alignItems: 'center' }} className={styles.isLoading}>
            <p>Loading confessions</p>
            <span>
              <Image src={'/gifs/istyping4.gif'} width={800 / 2} height={600 / 2} alt='' />
            </span>{' '}
          </div>
        }
        {/* Render CircularProgress while loading */}
        <div ref={sentinelRef} style={{ height: '10px', background: 'transparent' }}></div>
        {!hasMore &&
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '3rem', marginTop: '0' }} className={styles.isLoading}>
            <p style={{ padding: '1rem', textAlign: 'center', opacity: '0.7', scale: '0.8', fontWeight:'200' }}>You have reached the end</p>
          </div>
        }
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  // Fetch session and user details
  let session = null;
  session = await getSession(context);

  let college = '';
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

  // Fetch initial confessions based on user details
  let initialConfessions = [];
  try {
    let apiurl;
    if (college && session) {
      apiurl = `${pageurl}/api/confession/getdesiredconfessions?college=all&page=1&userCollege=${college}`;
    } else {
      apiurl = `${pageurl}/api/confession/getdesiredconfessions?college=all&page=1`;
    }
    const response = await fetch(apiurl);
    if (response.ok) {
      const data = await response.json();
      initialConfessions = data.confessions;
    } else {
      console.error('Error fetching initial confessions');
    }
  } catch (error) {
    console.error('Error fetching initial confessions:', error);
  }

  return {
    props: {
      userDetails,
      initialConfessions,
    },
  };
}

export default Index;
