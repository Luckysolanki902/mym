// pages/[id].js

import { getSession } from "next-auth/react";
import Image from "next/image";
import styles from './thankyou.module.css'
import Confession from "@/components/fullPageComps/Confession";
import { useRouter } from "next/router";
export async function getServerSideProps(context) {
    const session = await getSession(context);
    const pageurl = 'https://www.meetyourmate.in'
    const confessionId = context.params.id; // Get the confession ID from params
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
        const response = await fetch(`${pageurl}/api/confession/getconfessionbyid/${confessionId}`);
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
            session,
            confessionId,
            userDetails,
            confession
        }
    };
}

const ThankYouPage = ({ session, confessionId, userDetails, confession }) => {
    const router = useRouter()
    return (
        <div>
            {session && (
                <div className={styles.main}>
                    {/* <div className={styles.imgDiv}>
                        <Image src={'/images/illustrations/thankyou.png'} width={1650 / 4} height={1275 / 4} alt='thank you'></Image>
                    </div> */}
                    <button className={styles.button} onClick={() => router.push('/')}>back to home</button>
                    <h2 className={styles.successHeading}>
                        Confessed Successfully
                    </h2>
                    {confession && <Confession applyGenderBasedGrandients={true} confession={confession} userDetails={userDetails || null} />}
                    {/* <p>Your confession ID is: {confessionId}</p> */}
                </div>
            )}
        </div>
    );
};

export default ThankYouPage;
