// pages/inbox.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Typography, Card, CardContent, Divider } from '@mui/material';
import Link from 'next/link';
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text;
    }
    const truncatedText = text.substring(0, maxLength).trim();
    return `${truncatedText.substr(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(' ')))}...`;
};

const InboxPage = () => {
    const { data: session } = useSession();
    const [personalReplies, setPersonalReplies] = useState([]);

    useEffect(() => {
        const fetchPersonalReplies = async () => {
            if (session) {
                const email = session?.user?.email;
                try {
                    const response = await fetch(`/api/getdetails/getinbox?email=${email}`);
                    const { personalReplies } = await response.json();
                    setPersonalReplies(personalReplies);
                } catch (error) {
                    console.error('Error fetching personal replies:', error);
                }
            }
        };

        fetchPersonalReplies();
    }, [session]);

    const filteredReplies = personalReplies.filter((entry) => entry.replies.length > 0);

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Your Inbox
            </Typography>
            {filteredReplies.map((entry) => (
                <Card key={entry._id} style={{ marginBottom: '16px' }}>
                    <CardContent>
                        <Link href={`/confessions/${entry.confessionId._id}`} style={{color:'black', textDecoration:'none'}}>
                            <Typography variant="h6">
                                {truncateText(entry.confessionId.confessionContent, 100)}
                            </Typography>
                        </Link>
                        <>
                            <Divider style={{ margin: '8px 0' }} />
                            <Typography variant="body1" color="primary">
                                Replies:
                            </Typography>
                            {entry.replies.map((reply, index) => (
                                <Typography key={index} variant="body2" color="textSecondary">
                                    - {reply}
                                </Typography>
                            ))}
                        </>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default InboxPage;
