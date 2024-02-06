import React, { useState, useEffect } from 'react';
import Confession from '@/components/Confession';
import { useAuth } from '@/AuthContext';

const Index = () => {
  const { loading, userDetails } = useAuth();
  const [confessions, setConfessions] = useState([]);

  useEffect(() => {
    const fetchConfessions = async (college) => {
      try {
        const apiResponse = await fetch(`/api/confession/getconfessionsofyourcollege?college=${college}`);

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

    if (userDetails?.college) {
      fetchConfessions(userDetails.college);
    }
  }, [userDetails]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        confessions.map((confession) => (
          <Confession key={confession._id} confession={confession} userDetails={userDetails} applyGenderBasedGrandients={true} />
        ))
      )}
    </div>
  );
};

export default Index;
