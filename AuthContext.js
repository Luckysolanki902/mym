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
                    isVerified: userData.isVerified,
                });
                // Store user details in local storage
                localStorage.setItem('userDetails', JSON.stringify(userDetails));
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        const checkAndFetchUserDetails = async () => {
            if (!session) {
                // Redirect to signup page if no session
                router.push('/auth/signup');
            } else if (session?.user?.email) {
                try {
                    // Check if user details are in local storage and match the current session email
                    const storedUserDetails = localStorage.getItem('userDetails');
                    if (storedUserDetails) {
                        const parsedUserDetails = JSON.parse(storedUserDetails);
                        if (parsedUserDetails.email === session.user.email) {
                            setUserDetails(parsedUserDetails);
                        } else {
                            // Clear local storage and fetch user details for the new user
                            localStorage.removeItem('userDetails');
                            fetchUserDetails(session.user.email);
                        }
                    } else {
                        // Fetch user details if not in local storage
                        fetchUserDetails(session.user.email);
                    }
                } catch (error) {
                    console.error('Error loading user details from localStorage:', error);
                    // Handle the error - trigger a refetch or other appropriate actions
                    // For now, let's refetch the user details
                    fetchUserDetails(session.user.email);
                }
            }
        };

        const redirectToVerifyOtp = () => {
            if (
                userDetails &&
                !userDetails.isVerified &&
                !excludedPaths.some(path => router.pathname.startsWith(path))
            ) {
                console.log('Redirecting to otp verification');
                router.push('/verify/verifyotp');
            }
        };

        checkAndFetchUserDetails();
        redirectToVerifyOtp();
        return () => {
            if (!session) {
                setUserDetails(null);
                localStorage.removeItem('userDetails');
            }
        };
    }, [session, router]);


    const contextValue = {
        loading: status === 'loading',
        userDetails,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
