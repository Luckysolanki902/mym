import React from 'react';
import CreateConfessionForm from '@/components/CreateConfessionForm';
import { getSession } from 'next-auth/react';

const CreateConfession = ({ userDetails }) => {
  return (
    <div style={{ height: '80%' }}>
      <h1 style={{ textAlign: 'center', fontFamily: 'ITC Kristen', fontWeight: '100', marginTop: '2rem' }}>Create Confession</h1>
      <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'hidden', alignItems: 'center', height: '100%' }} className='remcomponents'>
        <CreateConfessionForm userDetails={userDetails} />
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
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

  return {
    props: {
      userDetails,
    },
  };
}

export default CreateConfession;
