import React, { useState, useEffect } from 'react';
import Confession from '@/components/Confession';
import { getSession } from 'next-auth/react';

const Index = () => {
  const [confessions, setConfessions] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const session = await getSession();

      if (session) {
        const userEmail = session.user.email;

        try {
          const userDetailsResponse = await fetch(`/api/getdetails/getuserdetails?userEmail=${userEmail}`);
          if (userDetailsResponse.ok) {
            const userDetailsData = await userDetailsResponse.json();
            setUserDetails(userDetailsData);
          } else {
            console.error('Error fetching user details');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const fetchConfessions = async () => {
      try {
        const apiResponse = await fetch(`/api/confession/getconfessions`);

        if (apiResponse.ok) {
          const confessionsData = await apiResponse.json();
          setConfessions(confessionsData.confessions);
        } else {
          console.error('Error fetching confessions');
        }
      } catch (error) {
        console.error('Error fetching confessions:', error);
      }
    };

    // Fetch user details and confessions when the component mounts
    fetchUserDetails();
    fetchConfessions();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        confessions.map((confession) => (
          <Confession key={confession._id} confession={confession} userDetails={userDetails} />
        ))
      )}
    </div>
  );
};

export default Index;
