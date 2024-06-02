import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Index = () => {
    const [chatStats, setChatStats] = useState({
        totalUsers: 0,
        maleUsers: 0,
        femaleUsers: 0
    });

    const [authStats, setAuthStats] = useState({
        totalUsers: 0,
        maleUsers: 0,
        femaleUsers: 0
    });

    const [confessionStats, setConfessionStats] = useState({
        totalConfessions: 0,
        maleConfessions: 0,
        femaleConfessions: 0,
        totalComments: 0,
        maleComments: 0,
        femaleComments: 0,
        totalLikes: 0,
        totalPersonalReplies: 0
    });

    const [fetchingChatStats, setFetchingChatStats] = useState(false);
    const [fetchingAuthStats, setFetchingAuthStats] = useState(false);
    const [fetchingConfessionStats, setFetchingConfessionStats] = useState(false);

    useEffect(() => {
        fetchChatStats();
        fetchAuthStats();
        fetchConfessionStats();
        const interval = setInterval(() => {
            fetchChatStats();
            fetchAuthStats();
            fetchConfessionStats();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const fetchChatStats = async () => {
        try {
            setFetchingChatStats(true);
            const response = await fetch('https://hostedmymserver.onrender.com/api/user-stats');
            if (!response.ok) {
                throw new Error('Failed to fetch chat stats');
            }
            const data = await response.json();
            setChatStats(data.textChatStats);
        } catch (error) {
            console.error('Error fetching chat stats:', error);
        } finally {
            setFetchingChatStats(false);
        }
    };

    const fetchAuthStats = async () => {
        try {
            setFetchingAuthStats(true);
            const response = await fetch('/api/admin/getdetails/getauthstats');
            if (!response.ok) {
                throw new Error('Failed to fetch auth stats');
            }
            const data = await response.json();
            setAuthStats(data);
        } catch (error) {
            console.error('Error fetching auth stats:', error);
        } finally {
            setFetchingAuthStats(false);
        }
    };

    const fetchConfessionStats = async () => {
        try {
            setFetchingConfessionStats(true);
            const response = await fetch('/api/admin/getdetails/getconfessionstats');
            if (!response.ok) {
                throw new Error('Failed to fetch confession stats');
            }
            const data = await response.json();
            setConfessionStats(data);
        } catch (error) {
            console.error('Error fetching confession stats:', error);
        } finally {
            setFetchingConfessionStats(false);
        }
    };

    const refreshChatStats = () => {
        fetchChatStats();
    };

    const refreshAuthStats = () => {
        fetchAuthStats();
    };

    const refreshConfessionStats = () => {
        fetchConfessionStats();
    };

    return (
        <Container maxWidth="lg" style={{ paddingTop: '2rem' }}>
            <Typography variant="h2" gutterBottom>
                User Stats
            </Typography>
            
            <Typography variant="h4" gutterBottom>
                Chat Page Stats
            </Typography>
            <Button variant="outlined" onClick={refreshChatStats} style={{ marginBottom: '1rem' }}>
                {fetchingChatStats ? 'Loading...' : 'Refresh Stats'}
            </Button>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Total Users: {chatStats.totalUsers}
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={[
                                        { name: 'Male', users: chatStats.maleUsers },
                                        { name: 'Female', users: chatStats.femaleUsers }
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
            </Grid>

            <Typography variant="h4" gutterBottom style={{ marginTop: '2rem' }}>
                Auth Stats
            </Typography>
            <Button variant="outlined" onClick={refreshAuthStats} style={{ marginBottom: '1rem' }}>
                {fetchingAuthStats ? 'Loading...' : 'Refresh Stats'}
            </Button>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Total Users: {authStats.totalUsers}
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={[
                                        { name: 'Male', users: authStats.maleUsers },
                                        { name: 'Female', users: authStats.femaleUsers }
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="users" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h4" gutterBottom style={{ marginTop: '2rem' }}>
                Confession Stats
            </Typography>
            <Button variant="outlined" onClick={refreshConfessionStats} style={{ marginBottom: '1rem' }}>
                {fetchingConfessionStats ? 'Loading...' : 'Refresh Stats'}
            </Button>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Total Confessions: {confessionStats.totalConfessions}
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={[
                                        { name: 'Male', confessions: confessionStats.maleConfessions },
                                        { name: 'Female', confessions: confessionStats.femaleConfessions }
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="confessions" fill="#ffc658" />
                                </BarChart>
                            </ResponsiveContainer>
                            <Typography variant="h6" component="p" style={{ marginTop: '1rem' }}>
                                Total Comments: {confessionStats.totalComments}
                            </Typography>
                            <Typography variant="body1" component="p">
                                Male Comments: {confessionStats.maleComments}
                            </Typography>
                            <Typography variant="body1" component="p">
                                Female Comments: {confessionStats.femaleComments}
                            </Typography>
                            <Typography variant="h6" component="p" style={{ marginTop: '1rem' }}>
                                Total Likes: {confessionStats.totalLikes}
                            </Typography>
                            <Typography variant="h6" component="p" style={{ marginTop: '1rem' }}>
                                Total Personal Replies: {confessionStats.totalPersonalReplies}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Index;
