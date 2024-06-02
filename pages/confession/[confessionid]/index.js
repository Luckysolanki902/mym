import React from 'react';
import Confession from '@/components/fullPageComps/Confession';
import { getSession } from 'next-auth/react';
import Link from 'next/link';

const ConfessionPage = ({ confession, userDetails }) => {
  return (
    <>
        {confession && <Confession confession={confession} userDetails={userDetails || null} />}
        <div style={{width:"100%", display:'flex', justifyContent:'center', alignItems:'center'}}>
        <Link style={{margin:'auto', textDecoration:'none'}} href={'/all-confessions'}>click to see all confessions</Link>
        </div>
    </>
  );
};

export async function getServerSideProps(context) {
  const { params } = context;
  const { confessionid } = params;

  // Fetch session and user details
  const session = await getSession(context);
  const pageurl = 'https://www.meetyourmate.in'

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

  // Fetch confession details
  let confession = null;
  try {
    const response = await fetch(`${pageurl}/api/confession/getconfessionbyid/${confessionid}`);
    if (response.ok) {
      confession = await response.json();
    } else {
      console.error('Error fetching confession details');
    }
  } catch (error) {
    console.error('Error fetching confession details:', error);
  }

  return {
    props: {
      confession,
      userDetails,
    },
  };
}

export default ConfessionPage;
