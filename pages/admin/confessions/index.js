import React, { useEffect, useRef, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import CircularProgress from '@mui/material/CircularProgress';
import { AppBar, Toolbar, Typography, Drawer, Select, MenuItem, Button, TextField } from '@mui/material'; // Import Drawer, Select, MenuItem, and Button from Material-UI
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import styles from './allconfessions.module.css';
import ConfessionForAdmin from '@/components/adminComps/Confessions/ConfessionForAdmin';

const Index = ({ userDetails, initialConfessions, colleges }) => {
    const [confessions, setConfessions] = useState(initialConfessions);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState(''); // State for selected option
    const [selectedCollege, setSelectedCollege] = useState(''); // State for selected college
    const [selectedEmail, setSelectedEmail] = useState(''); // State for entered email
    const [drawerOpen, setDrawerOpen] = useState(false); // State for drawer open/close
    const sentinelRef = useRef(null);
    const router = useRouter();

    const fetchMoreConfessions = async () => {
        setLoading(true);
        const response = await fetch(`/api/admin/confessions/getconfessions?page=${page + 1}`);
        if (response.ok) {
            const newConfessionsData = await response.json();
            const newConfessions = newConfessionsData.confessions;
            if (newConfessions.length === 0) {
                setHasMore(false);
            } else {
                setConfessions(prevConfessions => [...prevConfessions, ...newConfessions]);
                setPage(prevPage => prevPage + 1);
            }
        } else {
            console.error('Error fetching more confessions');
        }
        setLoading(false);
    };

    const handleDrawerOpen = () => {
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleCollegeChange = (event) => {
        setSelectedCollege(event.target.value);
    };

    const handleEmailChange = (event) => {
        setSelectedEmail(event.target.value);
    };

    const handleSubmit = () => {
        // Handle submit based on selected option (college or email)
        if (selectedOption === 'college') {
            // Fetch confessions by college
            // Example: fetch(`/api/admin/confessions/getconfessions?college=${selectedCollege}`);
        } else if (selectedOption === 'email') {
            // Fetch confessions by email
            // Example: fetch(`/api/admin/confessions/getconfessions?email=${selectedEmail}`);
            if (!selectedEmail.trim()) {
                alert('Please enter a valid email.');
                return;
            }
            // Here you can implement the logic to fetch confessions by email
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                fetchMoreConfessions();
            }
        }, { threshold: 0.5 });

        observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [hasMore, loading]);

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
            <div style={{ width: '100%', paddingTop: '2rem' }}>
                <h1 style={{ textAlign: 'center' }}>Confessions</h1>

                {/* <Button onClick={handleDrawerOpen} variant="contained" color="primary">Filter Options</Button> */}
                <Drawer
                    anchor="bottom"
                    open={drawerOpen}
                    onClose={handleDrawerClose}

                >
                    <div style={{ padding: '1rem', minHeight: '50vh', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'flex-start', maxWidth: '1000px', padding: '2rem' }}>
                        <h2>Filters</h2>
                        <Select
                            value={selectedOption}
                            onChange={handleOptionChange}
                            fullWidth
                            displayEmpty
                        // variant='standard'

                        >
                            <MenuItem value="" disabled>Select Option</MenuItem>
                            <MenuItem value="college">Find by College</MenuItem>
                            <MenuItem value="email">Find by Email</MenuItem>
                        </Select>
                        {selectedOption === 'college' && (
                            <Select
                                value={selectedCollege}
                                onChange={handleCollegeChange}
                                // variant='standard'

                                fullWidth
                                displayEmpty
                            >
                                <MenuItem value="" disabled>Select College</MenuItem>
                                {colleges?.map(college => (
                                    <MenuItem key={college._id} value={college.college}>{college.college}</MenuItem>
                                ))}
                            </Select>
                        )}
                        {selectedOption === 'email' && (
                            <TextField
                                variant='standard'
                                type="email"
                                placeholder="Enter Email"
                                value={selectedEmail}
                                onChange={handleEmailChange}
                                style={{ marginTop: '1rem', width: '100%', padding: '0.5rem' }}
                            />
                        )}
                        <Button onClick={handleSubmit} variant="contained" color="primary" style={{ marginTop: '1rem' }}>Submit</Button>
                    </div>
                </Drawer>

                {confessions.map((confession, index) => (
                    <ConfessionForAdmin key={confession._id} confession={confession} applyGenderBasedGrandients={true} />
                ))}
                {(loading) &&
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem', marginTop: '0' }} className={styles.isLoading}>
                        <p >Loading confessions</p>
                        <span>
                            <Image src={'/gifs/istyping4.gif'} width={800 / 2} height={600 / 2} alt='' />
                        </span>
                    </div>
                }
                <div ref={sentinelRef} style={{ height: '10px', background: 'transparent' }}></div>
                {!hasMore &&
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '3rem', marginTop: '0' }} className={styles.isLoading}>
                        <p style={{ padding: '1rem', textAlign: 'center', opacity: '0.7', scale: '0.8' }}>You have seen all available confessions of your college</p>
                    </div>
                }
            </div>
        </div>
    );
};

export async function getServerSideProps(context) {
    const pageurl = 'https://www.meetyourmate.in';
    let initialConfessions = [];
    try {
        const response = await fetch(`${pageurl}/api/admin/confessions/getconfessions?&page=1`);
        if (response.ok) {
            const data = await response.json();
            initialConfessions = data.confessions;
        } else {
            console.error('Error fetching initial confessions');
        }
    } catch (error) {
        console.error('Error fetching initial confessions:', error);
    }
    let colleges = [];
    try {
        const response = await fetch(`${pageurl}/api/admin/college/getcolleges`);
        if (response.ok) {
            const data = await response.json();
            colleges = data;
        } else {
            console.error('Error fetching colleges');
        }
    } catch (error) {
        console.error('Error fetching colleges:', error);
    }

    return {
        props: {
            userDetails: {},
            initialConfessions,
            colleges,
        },
    };
}

export default Index;
