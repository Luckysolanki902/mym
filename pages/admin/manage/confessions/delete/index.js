// pages/admin/manage/confessions/delete/index.js

import React, { useEffect, useRef, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './delete.module.css';
import CustomHead from '@/components/seo/CustomHead';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from '@mui/material';

const AdminDeleteConfessions = ({ }) => {
    const [confessions, setConfessions] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const sentinelRef = useRef(null);
    const router = useRouter();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [confessionToDelete, setConfessionToDelete] = useState(null);


    const fetchConfessions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/manage/confessions/getconfessions?page=${page}`);
            if (response.ok) {
                const data = await response.json();
                const newConfessions = data.confessions;
                if (newConfessions.length === 0) {
                    setHasMore(false);
                } else {
                    setConfessions(prevConfessions => [...prevConfessions, ...newConfessions]);
                    setPage(prevPage => prevPage + 1);
                }
            } else {
                console.error('Error fetching confessions:', response.status);
            }
        } catch (error) {
            console.error('Error fetching confessions:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!loading && hasMore) {
            fetchConfessions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                fetchConfessions();
            }
        }, { threshold: 0.5 });

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasMore, loading]);

    const handleDeleteClick = (confession) => {
        setConfessionToDelete(confession);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!confessionToDelete) return;

        try {
            const response = await fetch('/api/admin/manage/confessions/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ confessionId: confessionToDelete._id }),
            });

            if (response.ok) {
                // Remove the deleted confession from the list
                setConfessions(prevConfessions =>
                    prevConfessions.filter(c => c._id !== confessionToDelete._id)
                );
                setDeleteDialogOpen(false);
                setConfessionToDelete(null);
            } else {
                const errorData = await response.json();
                console.error('Error deleting confession:', errorData.error);
                alert(`Error deleting confession: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error deleting confession:', error);
            alert('An unexpected error occurred while deleting the confession.');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setConfessionToDelete(null);
    };

    return (
        <>
            <div style={{ width: '100%', paddingTop: '2rem', display:'flex', flexDirection:'column', alignItems:'center'}}>
                <div className={styles.chipContainer}>
                    <h1 className={styles.mainHeading}>Manage Confessions</h1>
                </div>
                {/* You can add filter options here if needed */}
                {confessions.map((confession) => (
                    <div key={confession._id} className={styles.confessionContainer}>
                        <Confession
                            confession={confession}
                            applyGenderBasedGrandients={true}
                            isAdmin={true} // Pass isAdmin as true
                            onDelete={handleDeleteClick} // Pass the delete handler
                        />
                    </div>
                ))}
                {loading &&
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '3rem', marginTop: '0', alignItems: 'center' }} className={styles.isLoading}>
                        <p>Loading confessions</p>
                        <span>
                            ...loading            </span>
                    </div>
                }
                <div ref={sentinelRef} style={{ height: '10px', background: 'transparent' }}></div>
                {!hasMore &&
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '3rem', marginTop: '0' }} className={styles.isLoading}>
                        <p style={{ padding: '1rem', textAlign: 'center', opacity: '0.7', transform: 'scale(0.8)', fontWeight: '200' }}>You have reached the end</p>
                    </div>
                }
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete this confession? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};


export default AdminDeleteConfessions;
