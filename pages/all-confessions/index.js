import { getSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import InfiniteScroll from 'react-infinite-scroll-component';

const Index = ({ userDetails, initialConfessions }) => {
  const [confessions, setConfessions] = useState(initialConfessions);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchMoreData = async () => {
    try {
      const response = await fetch(`/api/confession/getconfessions?page=${page + 1}`);
      if (response.ok) {
        const data = await response.json();
        if (data.confessions.length === 0) {
          setHasMore(false);
          return;
        }
        setConfessions([...confessions, ...data.confessions]);
        setPage(page + 1);
      } else {
        console.error('Error fetching more confessions:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching more confessions:', error);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <InfiniteScroll
        dataLength={confessions.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p>No more confessions to load</p>}
        scrollThreshold={0.9} // Adjust this threshold as needed
      >
        {confessions.map((confession) => (
          <Confession key={confession._id} confession={confession} userDetails={userDetails} applyGenderBasedGrandients={true} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export async function getServerSideProps(context) {
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

  let initialConfessions = [];
  try {
    const apiResponse = await fetch(`${pageurl}/api/confession/getconfessions?page=1`);
    if (apiResponse.ok) {
      const confessionsData = await apiResponse.json();
      initialConfessions = confessionsData.confessions;
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
