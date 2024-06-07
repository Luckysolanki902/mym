import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid, Card, CardContent, AppBar, Toolbar } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

const Index = () => {
    const [chatStats, setChatStats] = useState({
        totalUsers: 0,
        maleUsers: 0,
        femaleUsers: 0,
        collegeStats: []
    });
    

    const [authStats, setAuthStats] = useState({
        totalUsers: 0,
        maleUsers: 0,
        femaleUsers: 0,
        collegeStats: []
    });

    const [confessionStats, setConfessionStats] = useState({
        totalConfessions: 0,
        maleConfessions: 0,
        femaleConfessions: 0,
        totalComments: 0,
        maleComments: 0,
        femaleComments: 0,
        totalLikes: 0,
        totalPersonalReplies: 0,
        collegeStats: []
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
        }, 30000);

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

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" style={{ flexGrow: 1, textAlign: 'center', cursor: 'pointer' }}>
                        <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Admin Panel
                        </Link>
                    </Typography>
                </Toolbar>
            </AppBar>
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
                    Live Users: {chatStats.totalUsers}
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
    <Grid item xs={12} sm={6}>
        <Card>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    College-wise Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={Object.entries(chatStats.collegeStats).map(([name, value]) => ({ name, value }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label
                        >
                            {Object.keys(chatStats.collegeStats).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
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
                    <Grid item xs={12} sm={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h2" gutterBottom>
                                    College-wise Distribution
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={authStats.collegeStats.map(college => ({ name: college._id, value: college.count }))}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label
                                        >
                                            {
                                                authStats.collegeStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))
                                            }
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
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
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h2" gutterBottom>
                                    College-wise Distribution
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={confessionStats.collegeStats.map(college => ({ name: college._id, value: college.count }))}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label
                                        >
                                            {
                                                confessionStats.collegeStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))
                                            }
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3} style={{ marginTop: '2rem' }}>
                    <Grid item xs={12} sm={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="p">
                                    Total Comments: {confessionStats.totalComments}
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={[
                                            { name: 'Male', comments: confessionStats.maleComments },
                                            { name: 'Female', comments: confessionStats.femaleComments }
                                        ]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="comments" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="p">
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
        </div>
    );
};

export default Index;
