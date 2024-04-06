import React from 'react';
import { getSession, useSession } from 'next-auth/react';
import { Typography, Card, CardContent, Divider } from '@mui/material';
import Link from 'next/link';
import styles from '@/components/componentStyles/inboxStyles.module.css'

import InboxCard from '@/components/confessionComps/InboxCard';


const noEntry = {
  "confessionContent": "Replies to your confessions will appear here",
  "replies": [
  ],
}
const InboxPage = ({ personalReplies, userDetails }) => {
  // Extract personalReplies array from the object
  const repliesArray = personalReplies.personalReplies;

  return (
    <div className={styles.cotainer}>
      <h1 className={styles.h1}>
        Inbox
      </h1>
      {repliesArray?.length > 0 ? (
        repliesArray.map((entry, index) => (
          <div key={`${entry._id}${index}`}>
            <InboxCard style={{ marginBottom: '16px' }}
              entry={entry}
              userDetails={userDetails}
            />

          </div>
  ))
      ) : (
        <InboxCard style={{ marginBottom: '16px' }}
        entry={noEntry}
        userDetails={userDetails}
      />
)}
    </div >
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = 'https://www.meetyourmate.in';
  let personalReplies = {};
  let userDetails = null;

  if (session) {
    const email = session?.user?.email;
    if (email) {
      // getting details
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
    // getting personal replies
      try {
        const response = await fetch(`${pageurl}/api/inbox/getinbox?email=${email}`);
        if (response.ok) {
          const responseData = await response.json();
          personalReplies = responseData;
        } else {
          const errorData = await response.json();
          console.log('Error fetching repplies:', errorData);
        }
      } catch (error) {
        console.log('Error fetching replies:', error);
      }
    }
  }

  return {
    props: {
      personalReplies,
      userDetails,
    },
  };
}

export default InboxPage;
