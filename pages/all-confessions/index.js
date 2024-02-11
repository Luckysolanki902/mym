import { getSession } from 'next-auth/react';
import React from 'react';
import Confession from '@/components/Confession';

const Index = ({ userDetails, confessions }) => {
  return (
    <div>
      {confessions.map((confession) => (
        <Confession key={confession._id} confession={confession} userDetails={userDetails} applyGenderBasedGrandients={true} />
      ))}
    </div>
  );
};

export async function getServerSideProps(context) {
  // Fetch session and user details
  const session = await getSession(context);
const pageurl = 'http://localhost:3000'  
  let userDetails = null;
  if (session?.user?.email) {
    try {
      const response = await fetch(`${pageurl}/api/getdetails/getuserdetails?userEmail=${session.user.email}`);
      if (response.ok) {
        const userData = await response.json();
        userDetails = {
          email: userData.email || 'Not Available',
          gender: userData.gender || 'Not Available',
          college: userData.college || 'Not Available',
          isVerified: userData.isVerified || false,
        };
      } else {
        console.error('Error fetching user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }

  // Fetch confessions based on user details
  let confessions = [];
  if (userDetails?.college) {
    try {
      const apiResponse = await fetch(`${pageurl}/api/confession/getconfessionsofyourcollege?college=${userDetails.college}`);
      if (apiResponse.ok) {
        const confessionsData = await apiResponse.json();
        confessions = confessionsData.confessions;
      } else {
        console.error('Error fetching confessions');
      }
    } catch (error) {
      console.error('Error fetching confessions:', error);
    }
  }

  return {
    props: {
      userDetails,
      confessions,
    },
  };
}

export default Index;
