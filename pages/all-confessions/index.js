import React, { useEffect, useRef, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import InfiniteScroll from 'react-infinite-scroll-component'; // Assuming you have installed react-infinite-scroll-component
import { getSession } from 'next-auth/react';
const Index = ({ userDetails, initialConfessions }) => {
  const [confessions, setConfessions] = useState(initialConfessions);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  useEffect(()=>{
    console.log('confessions:', initialConfessions, confessions)
  },[])

  const fetchMoreConfessions = async () => {
    console.log('fetching more...')
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
  };

  
  return (
    <div style={{ width: '100%' }}>
      <InfiniteScroll
        dataLength={confessions.length}
        next={fetchMoreConfessions}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p>No more confessions to load</p>}
        scrollableTarget="scrollableDiv"
      >
        {confessions.map((confession) => (
          <Confession key={confession._id} confession={confession} userDetails={userDetails} applyGenderBasedGrandients={true} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export async function getServerSideProps(context) {
  // Fetch session and user details
  const session = await getSession(context);
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
