import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container, Typography, Button, Grid, Card, CardContent, ListItem, List, ListItemText } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Index = () => {
    const [userStats, setUserStats] = useState({
        textChatStats: {
            totalUsers: 0,
            maleUsers: 0,
            femaleUsers: 0
        }
    });

    useEffect(() => {
        fetchUserStats();
        const interval = setInterval(fetchUserStats, 60000); // Fetch stats every minute

        return () => clearInterval(interval); // Cleanup interval
    }, []);

    const fetchUserStats = async () => {
        try {
            const response = await fetch('https://hostedmymserver.onrender.com/api/user-stats');
            if (!response.ok) {
                throw new Error('Failed to fetch user stats');
            }
            const data = await response.json();
            setUserStats(data);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const refreshStats = () => {
        fetchUserStats();
    };

    return (
        <Container maxWidth="lg" style={{ paddingTop: '2rem' }}>
            <Typography variant="h3" gutterBottom>
                Admin Homepage
            </Typography>
            <div style={{ marginTop: '2rem' }}>
                <List>
                    <ListItem button component={Link} href="/admin/confessions">
                        <ListItemText primary="Confessions" />
                    </ListItem>
                    <ListItem button component={Link} href="/admin/addcollege">
                        <ListItemText primary="Add College" />
                    </ListItem>
                    <ListItem button component={Link} href="/admin/testids">
                        <ListItemText primary="Test Ids" />
                    </ListItem>
                    <ListItem button component={Link} href="/admin/user-stats">
                        <ListItemText primary="User Stats" />
                    </ListItem>
                </List>
            </div>
        </Container>
    );
};

export default Index;
