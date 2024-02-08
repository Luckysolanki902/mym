// pages/confessions/[confessionid].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import Confession from '@/components/Confession'; // Adjust the path based on your project structure
import { useAuth } from '@/AuthContext';


const ConfessionPage = () => {
    const router = useRouter();
    const { confessionid } = router.query;
    const [confession, setConfession] = useState(null);
    const { loading, userDetails } = useAuth();

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
        // Fetch confession details and user details when the component mounts
        fetchConfessionDetails();
    }, [confessionid]);


    return (

        <div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    {confession && <Confession confession={confession} userDetails={userDetails || null} />}
                </div>
            )}
        </div>
    );
};

export default ConfessionPage;
