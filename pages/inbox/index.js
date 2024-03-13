import React from 'react';
import { getSession, useSession } from 'next-auth/react';
import { Typography, Card, CardContent, Divider } from '@mui/material';
import Link from 'next/link';

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }
  const truncatedText = text.substring(0, maxLength).trim();
  return `${truncatedText.substr(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(' ')))}...`;
};

const InboxPage = ({ personalReplies }) => {
console.log(personalReplies)
  // Extract personalReplies array from the object
  const repliesArray = personalReplies.personalReplies;

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Your Inbox
      </Typography>
      {repliesArray?.map((entry) => (
        <Card key={entry._id} style={{ marginBottom: '16px' }}>
          <CardContent>
            <Link href={`/confessions/${entry.confessionId._id}`} passHref>
                <Typography variant="h6">
                  {truncateText(entry.confessionId.confessionContent, 100)}
                </Typography>
            </Link>
            <>
              <Divider style={{ margin: '8px 0' }} />
              <Typography variant="body1" color="primary">
                Replies:
              </Typography>
              {/* {entry.replies.map((reply, index) => (
                <Typography key={index} variant="body2" color="textSecondary">
                  - {reply.reply}
                </Typography>
              ))} */}
            </>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = 'https://www.meetyourmate.in';
  let personalReplies = [];

  if (session) {
    const email = session?.user?.email;
    if (email) {
      try {
        const response = await fetch(`${pageurl}/api/getdetails/getinbox?email=${email}`);
        if (response.ok) {
          const responseData = await response.json();
          personalReplies = responseData;
        } else {
          const errorData = await response.json();
          console.log('Error fetching user details:', errorData);
        }
      } catch (error) {
        console.log('Error fetching user details:', error);
      }
    }
  }

  return {
    props: {
      personalReplies,
    },
  };
}

export default InboxPage;
