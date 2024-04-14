import React, {useEffect} from 'react';
import CreateConfessionForm from '@/components/fullPageComps/CreateConfessionForm';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const CreateConfession = ({ userDetails }) => {
  const router = useRouter();
  useEffect(() => {
    // Redirect to verify/verifyotp if userDetails is not verified
    if (userDetails && !userDetails.isVerified) {
      router.push('/verify/verifyotp');
    }
  }, [userDetails]);
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
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signup',
        permanent: false,
      },
    };
  }

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
