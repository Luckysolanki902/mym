import React, { useEffect, useRef, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import { getSession } from 'next-auth/react';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress from Material-UI
import { useRouter } from 'next/router';
import Image from 'next/image';

const Index = ({ userDetails, initialConfessions }) => {
  const [confessions, setConfessions] = useState(initialConfessions);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false); // Add loading state
  const sentinelRef = useRef(null);

  const router = useRouter();
  useEffect(() => {
    // Redirect to verify/verifyotp if userDetails is not verified
    if (userDetails && !userDetails.isVerified) {
      router.push('/verify/verifyotp');
    }
  }, [userDetails]);


  const fetchMoreConfessions = async () => {
    console.log('fetching more...');
    setLoading(true); // Set loading to true while fetching
    const response = await fetch(`/api/confession/getconfessionsofyourcollege?college=${userDetails.college}&page=${page + 1}`);
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

  return (
    <div style={{ width: '100%', paddingTop:'2rem' }}>

      {confessions.map((confession, index) => (
        <Confession key={confession._id} confession={confession} userDetails={userDetails} applyGenderBasedGrandients={true} />
      ))}
      {loading &&
        <div style={{ width: '1oo%', display: 'flex', justifyContent: 'center', marginBottom:'3rem', marginTop:'0' }}>
          {/* <CircularProgress /> */}
          <Image src={'/gifs/loadinghand.gif'} width={498} height={498} alt='loading more' loop={true}
          style={{filter: 'grayscale(100%)'}}></Image>
        </div>

      } {/* Render CircularProgress while loading */}
      <div ref={sentinelRef} style={{ height: '10px', background: 'transparent' }}></div>
      {!hasMore &&
        <div style={{ width: '1oo%', display: 'flex', justifyContent: 'center', marginBottom:'3rem', marginTop:'0' }}>
          <p>No more confessions to load</p>
        </div>

      }
    </div>
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

  const pageurl = 'https://www.meetyourmate.in';
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
  if (userDetails?.college) {
    try {
      const response = await fetch(`${pageurl}/api/confession/getconfessionsofyourcollege?college=${userDetails.college}&page=1`);
      if (response.ok) {
        const data = await response.json();
        initialConfessions = data.confessions;
      } else {
        console.error('Error fetching initial confessions');
      }
    } catch (error) {
      console.error('Error fetching initial confessions:', error);
    }
  }

  return {
    props: {
      userDetails,
      initialConfessions,
    },
  };
}

export default Index;
