// pages/confessions/[confessionid].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import Confession from '@/components/Confession'; // Adjust the path based on your project structure

const ConfessionPage = () => {
    const router = useRouter();
    const { confessionid } = router.query;
    const [confession, setConfession] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfessionDetails = async () => {
            if (confessionid) {

                try {
                    const response = await fetch(`/api/confession/getconfessionbyid/${confessionid}`);
                    if (response.ok) {
                        const confessionData = await response.json();
                        setConfession(confessionData);
                    } else {
                        console.error('Error fetching confession details');
                    }
                } catch (error) {
                    console.error('Error fetching confession details:', error);
                }
            }
        };

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

        // Fetch confession details and user details when the component mounts
        fetchConfessionDetails();
        fetchUserDetails();
    }, [confessionid]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {/* Pass entire confession object and userDetails to Confession component */}
            {confession && userDetails && <Confession confession={confession} userDetails={userDetails} />}
        </div>
    );
};

export default ConfessionPage;
