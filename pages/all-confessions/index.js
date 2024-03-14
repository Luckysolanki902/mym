import { getSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import InfiniteScroll from 'react-infinite-scroll-component';

const Index = ({ userDetails, initialConfessions, totalPages }) => {
  const [confessions, setConfessions] = useState(initialConfessions);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMoreConfessions = async () => {
    if (currentPage >= totalPages) {
      setHasMore(false);
      return;
    }

    try {
      const response = await fetch(`/api/confession?page=${currentPage + 1}`);
      if (response.ok) {
        const data = await response.json();
        setConfessions((prevConfessions) => [...prevConfessions, ...data.confessions]);
        setCurrentPage(currentPage + 1);
      } else {
        console.error('Error fetching more confessions');
      }
    } catch (error) {
      console.error('Error fetching more confessions:', error);
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
  let totalPages = 1;

  try {
    const initialResponse = await fetch(`/api/confession`);
    if (initialResponse.ok) {
      const data = await initialResponse.json();
      initialConfessions = data.confessions;
      totalPages = data.totalPages;
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
      totalPages,
    },
  };
}

export default Index;
