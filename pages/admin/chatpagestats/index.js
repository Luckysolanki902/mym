import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container, Typography, Button, Grid, Card, CardContent, ListItem, List, ListItemText, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Index = () => {
    const [userStats, setUserStats] = useState({
        textChatStats: {
            totalUsers: 0,
            maleUsers: 0,
            femaleUsers: 0
        }
    });
    const [fetchingStats, setFetchingStats] = useState(false); // State to track fetching status

    useEffect(() => {
        fetchUserStats();
        const interval = setInterval(fetchUserStats, 60000); // Fetch stats every minute

        return () => clearInterval(interval); // Cleanup interval
    }, []);

    const fetchUserStats = async () => {
        try {
            setFetchingStats(true); // Set fetching status to true
            const response = await fetch('https://hostedmymserver.onrender.com/api/user-stats');
            if (!response.ok) {
                throw new Error('Failed to fetch user stats');
            }
            const data = await response.json();
            setUserStats(data);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        } finally {
            setFetchingStats(false); // Set fetching status to false after fetching completes
        }
    };

    const refreshStats = () => {
        fetchUserStats();
    };

    return (
        <Container maxWidth="lg" style={{ paddingTop: '2rem' }}>
            <Typography variant="h3" gutterBottom>
                Chat Page Stats
            </Typography>
            {/* Replace button with spinner if fetching stats */}
            <Button variant="outlined" onClick={refreshStats} style={{ marginBottom: '1rem' }}>
                    {fetchingStats ? 'Loading...': 'Refresh Stats'}
                </Button>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Total Users: {userStats.textChatStats.totalUsers}
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={[
                                        { name: 'Male', users: userStats.textChatStats.maleUsers },
                                        { name: 'Female', users: userStats.textChatStats.femaleUsers }
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="users" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                    {/* Other sections */}
                </Grid>
            </Grid>
  
        </Container>
    );
};

export default Index;
