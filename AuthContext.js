// AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
const excludedPaths = ['/admin', '/auth', '/verify', '/confession', '/api'];
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { data: session, status } = useSession();
    const [userDetails, setUserDetails] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserDetails = async (email) => {
            try {
                const response = await fetch(`/api/getdetails/getuserdetails?userEmail=${email}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                const userData = await response.json();
                setUserDetails({
                    email: userData.email || 'Not Available',
                    gender: userData.gender || 'Not Available',
                    college: userData.college || 'Not Available',
                    isVerified: userData.isVerified || false,
                });
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        // Check if there is a session
        if (!session
            && router.pathname !== '/'
            && !excludedPaths.some(path => router.pathname.startsWith(path))
        ) {
            // Redirect to signup page if no session
            router.push('/auth/signup');
        } else if (session?.user?.email) {
            // Fetch user details if session is available
            fetchUserDetails(session.user.email);
        }
    }, [session, router]);


    useEffect(() => {

        const redirectToVerifyOtp = async () => {
            // Check if the path is not in the excludedPaths array
            if (
                userDetails &&
                !userDetails.isVerified &&
                router.pathname !== '/' &&
                !excludedPaths.some(path => router.pathname.startsWith(path))
            ) {
                console.log('Redirecting to otp verification');
                router.push('/verify/verifyotp');
            }
        };

        redirectToVerifyOtp();

        // Cleanup function
        return () => { };
    }, [userDetails, router.pathname]);



    const contextValue = {
        loading: status === 'loading',
        userDetails,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
