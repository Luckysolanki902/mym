import React, { useEffect, useRef, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import { getSession } from 'next-auth/react';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './allconfessions.module.css';
import CustomHead from '@/components/seo/CustomHead';
import FilterOptions from '@/components/confessionComps/FilterOptions';

const Index = ({ userDetails }) => {
  const [confessions, setConfessions] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ college: 'all', gender: '' });
  const sentinelRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (userDetails && !userDetails?.isVerified) {
      router.push('/verify/verifyotp');
    }
  }, [userDetails, router]);

  const fetchConfessions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/confession/getdesiredconfessions?college=${filters.college}&gender=${filters.gender}&page=${page}&userCollege=${userDetails?.college}`);
      if (response.ok) {
        const data = await response.json();
        const newConfessions = data.confessions;
        if (newConfessions.length === 0) {
          setHasMore(false);
        } else {
          setConfessions(prevConfessions => [...prevConfessions, ...newConfessions]);
          setPage(prevPage => prevPage + 1);
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
    fetchConfessions();
  }, [filters, userDetails]); // Fetch confessions when filters change

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchConfessions();
      }
    }, { threshold: 0.5 });

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading, filters]); // Ensure observer updates when `hasMore`, `loading`, or `filters` change

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setConfessions([]);
    setPage(1);
    setHasMore(true);
  };



  return (
    <>
      <CustomHead title={'Read Confessions | MYM'} />
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
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '3rem', marginTop: '0', alignItems: 'center' }} className={styles.isLoading}>
            <p>Loading confessions</p>
            <span>
              <Image src={'/gifs/istyping4.gif'} width={800 / 2} height={600 / 2} alt='' />
            </span>
          </div>
        }
        <div ref={sentinelRef} style={{ height: '10px', background: 'transparent' }}></div>
        {!hasMore &&
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '3rem', marginTop: '0' }} className={styles.isLoading}>
            <p style={{ padding: '1rem', textAlign: 'center', opacity: '0.7', scale: '0.8', fontWeight: '200' }}>You have reached the end</p>
          </div>
        }
      </div>
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
