import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Chip, Typography, Paper, Snackbar, Skeleton } from '@mui/material';
import Link from 'next/link';

const UserFeedbacksAndSuggestions = () => {
    const [forms, setForms] = useState([]);
    const [filteredForms, setFilteredForms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const response = await fetch('/api/admin/getdetails/getfeedbacksandsuggestions');
                const data = await response.json();
                setForms(data);
                setFilteredForms(data);
                setCategories(['All', ...new Set(data.map(form => form.category))]);
                setLoading(false);
            } catch (error) {
                setSnackbarMessage('Unable to fetch forms');
                setSnackbarOpen(true);
                setLoading(false);
            }
        };

        fetchForms();
    }, []);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        if (category === 'All') {
            setFilteredForms(forms);
        } else {
            setFilteredForms(forms.filter(form => form.category === category));
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'rgb(35,35,35)' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" style={{ flexGrow: 1, textAlign: 'center', cursor: 'pointer' }}>
                        <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Admin Panel
                        </Link>
                    </Typography>
                </Toolbar>
            </AppBar>

            <div style={{ display: 'block', backgroundColor: 'rgb(35,35,35)', margin: '0', padding: '0' }}>
                <div style={{ padding: '20px' }}>
                    <h2 style={{ margin: '0', marginBottom: '1rem', marginLeft: '1rem', color: 'white' }}>Feedback and Suggestions</h2>
                    <div style={{ display: 'flex', overflow: 'auto', padding: '0 1rem', gap: '1rem' }}>
                        {loading ? (
                            Array.from(new Array(5)).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    variant="rectangular"
                                    width={100}
                                    height={32}
                                    animation="wave"
                                    style={{ backgroundColor: 'rgb(55, 55, 55)', borderRadius: '16px' }}
                                />
                            ))
                        ) : (
                            categories.map((category) => (
                                <Chip
                                    key={category}
                                    label={category}
                                    clickable
                                    color={category === selectedCategory ? 'primary' : 'default'}
                                    onClick={() => handleCategoryChange(category)}
                                />
                            ))
                        )}
                    </div>

                    <div style={{ marginTop: '2rem', padding: '0 1rem' }}>
                        {loading ? (
                            Array.from(new Array(3)).map((_, index) => (
                                <Paper key={index} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgb(45, 45, 45)' }}>
                                    <Skeleton animation="wave" variant="text" height={40} width="60%" style={{ backgroundColor: 'rgb(55, 55, 55)' }} />
                                    <Skeleton animation="wave" variant="text" height={20} width="80%" style={{ backgroundColor: 'rgb(55, 55, 55)' }} />
                                    <Skeleton animation="wave" variant="text" height={20} width="80%" style={{ backgroundColor: 'rgb(55, 55, 55)', marginBottom: '1rem' }} />
                                    <Skeleton animation="wave" variant="rectangular" height={20} width="90%" style={{ backgroundColor: 'rgb(55, 55, 55)' }} />
                                    <Skeleton animation="wave" variant="rectangular" height={20} width="90%" style={{ backgroundColor: 'rgb(55, 55, 55)', marginBottom: '1rem' }} />
                                </Paper>
                            ))
                        ) : (
                            filteredForms.map((form) => (
                                <Paper key={form._id} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgb(45, 45, 45)', color: 'white' }}>
                                    <Typography variant="h6">{form.category}</Typography>
                                    <Typography variant="body1" style={{ marginBottom: '2rem' }}>{form.description}</Typography>

                                    {form.recreateBug && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                                            <Typography variant="body2">
                                                <div style={{ fontSize: '0.9rem', backgroundColor: 'rgb(33, 33, 33)', padding: '0.5rem 1rem', borderRadius: '3rem', display: 'inline', marginBottom: '1rem' }}>Recreate Bug</div>
                                            </Typography>
                                            <Typography variant='body2' sx={{ marginLeft: '1rem' }}>
                                                {form.recreateBug}
                                            </Typography>
                                        </div>
                                    )}
                                    {form.collegeName && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                                            <Typography variant="body2">
                                                <div style={{ fontSize: '0.9rem', backgroundColor: 'rgb(33, 33, 33)', padding: '0.5rem 1rem', borderRadius: '3rem', display: 'inline', marginBottom: '1rem' }}>College Name</div>
                                            </Typography>
                                            <Typography variant='body2' sx={{ marginLeft: '1rem' }}>
                                                {form.collegeName}
                                            </Typography>
                                        </div>
                                    )}
                                    {form.collegeId && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                                            <Typography variant="body2">
                                                <div style={{ fontSize: '0.9rem', backgroundColor: 'rgb(33, 33, 33)', padding: '0.5rem 1rem', borderRadius: '3rem', display: 'inline', marginBottom: '1rem' }}>College ID</div>
                                            </Typography>
                                            <Typography variant='body2' sx={{ marginLeft: '1rem' }}>
                                                {form.collegeId}
                                            </Typography>
                                        </div>
                                    )}
                                </Paper>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </div>
    );
};

export default UserFeedbacksAndSuggestions;
