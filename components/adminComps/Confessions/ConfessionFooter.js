import React, { useEffect, useState } from 'react';
import { FaHeart, FaComment } from 'react-icons/fa';
import { Button, useMediaQuery, Dialog, DialogTitle, DialogContent, CircularProgress, Typography } from '@mui/material';
import styles from '@/components/componentStyles/confession.module.css';

const ConfessionFooter = ({ confession, userDetails, commentsCount, toggleCommentsDialog }) => {
    const [liked, setLiked] = useState(false);
    const [likeAnimation, setLikeAnimation] = useState('');
    const [likesCount, setLikesCount] = useState(confession.likes.length);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [details, setDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const isSmallDevice = useMediaQuery('(max-width:800px)');

    const guessYearAndBranch = (email) => {
        // Extract the starting year from the email (first two digits)
        const startingYear = parseInt(email.substr(0, 2), 10);

        // Determine the current year and month
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear().toString().slice(-2);

        const currentMonth = currentDate.getMonth() + 1; // Month is zero-indexed

        // Calculate the student's current year of study
        let guessedYear = currentYear - startingYear + 1;
        if (currentMonth < 7) {
            // If the current month is before July, the student is still in the previous academic year
            guessedYear--;
        }

        // Map the guessed year to the appropriate string
        let yearString = '';
        if (guessedYear === 1) {
            yearString = 'First Year';
        } else if (guessedYear === 2) {
            yearString = 'Second Year';
        } else if (guessedYear === 3) {
            yearString = 'Third Year';
        } else if (guessedYear === 4) {
            yearString = 'Final Year';
        } else if (guessedYear > 4) {
            yearString = 'Passed Out';
        }else{
            yearString = "Can't Decide";
        }


        // Extract the branch code from the email (next four digits)
        const branchCode = parseInt(email.substr(2, 4), 10);

        // Map branch codes to branch names
        const branchMap = {
            101: 'Bio Chemical Engineering',
            103: 'Chemical Engineering',
            102: 'Civil Engineering',
            104: 'Computer Science Engineering',
            105: 'Electrical Engineering',
            106: 'Electronics Engineering',
            107: 'Food Technology',
            108: 'Information Technology',
            110: 'Mechanical Engineering',
            113: 'Plastic Technology',
        };

        // Determine the guessed branch
        let guessedBranch = branchMap[branchCode];
        if (!guessedBranch) {
            guessedBranch = "Can't Decide"; // If the branch code is not recognized
        }

        return { guessedYear: yearString, guessedBranch };
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const currentDate = new Date();
        const secondsAgo = Math.floor((currentDate - date) / 1000);
        const minutesAgo = Math.floor(secondsAgo / 60);
        const hoursAgo = Math.floor(minutesAgo / 60);
        const daysAgo = Math.floor(hoursAgo / 24);
        const weeksAgo = Math.floor(daysAgo / 7);
        const monthsAgo = Math.floor(daysAgo / 30);
        const yearsAgo = Math.floor(daysAgo / 365);
    
        if (secondsAgo < 60) {
            return 'Just now';
        } else if (minutesAgo === 1) {
            return 'A minute ago';
        } else if (minutesAgo < 60) {
            return `${minutesAgo} minutes ago`;
        } else if (hoursAgo === 1) {
            return 'An hour ago';
        } else if (hoursAgo < 24) {
            return `${hoursAgo} hours ago`;
        } else if (daysAgo === 1) {
            return 'Yesterday at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else if (daysAgo < 7) {
            return `${daysAgo} days ago`;
        } else if (weeksAgo === 1) {
            return 'A week ago';
        } else if (weeksAgo < 4) {
            return `${weeksAgo} weeks ago`;
        } else if (monthsAgo === 1) {
            return 'A month ago';
        } else if (monthsAgo < 12) {
            return `${monthsAgo} months ago`;
        } else if (yearsAgo === 1) {
            return 'A year ago';
        } else {
            return `${yearsAgo} years ago`;
        }
    };
    

    useEffect(() => {
        // Fetch likes for the confession
        const fetchLikes = async () => {
            try {
                const response = await fetch(
                    `/api/getdetails/getlikes?confessionId=${confession._id}`
                );
                if (response.ok) {
                    const { likes } = await response.json();
                    setLiked(likes.some(like => like.userEmail === userDetails?.email));
                    setLikesCount(likes.length);
                } else {
                    console.error('Error fetching likes:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching likes:', error);
            }
        };

        fetchLikes();
    }, [confession, userDetails]);

    const handleLike = async () => {
        // Handle like functionality
    };

    const handleDetailsClick = async () => {
        setLoadingDetails(true);
        try {
            const response = await fetch('/api/admin/security/decrypt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: confession._id
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setDetails(data);
            } else {
                console.error('Error fetching details:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoadingDetails(false);
            setDetailsDialogOpen(true);
        }
    };


    const handleCloseDetailsDialog = () => {
        setDetailsDialogOpen(false);
    };

    return (
        <div>
            <div className={styles.confessionfooter}>
                <div className={styles.likes} onClick={handleLike} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaHeart className={`${styles.iconm} ${liked ? styles.redheart : ''} ${likeAnimation ? styles[likeAnimation] : ''}`} />
                    </div>
                    <div>{likesCount}</div>
                </div>
                <div className={styles.likes} onClick={toggleCommentsDialog} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaComment style={{ color: 'white' }} className={styles.iconm} />
                    </div>
                    <div>{commentsCount}</div>
                </div>
                <Button variant="contained" style={{ backgroundColor: 'inherit', color: 'inherit' }} className={styles.reply} onClick={handleDetailsClick}>
                    <div>Show Details</div>
                </Button>
            </div>
            <Dialog open={detailsDialogOpen} onClose={handleCloseDetailsDialog}>
                <DialogTitle>Confession Details</DialogTitle>
                <DialogContent>
                    {loadingDetails ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress />
                        </div>
                    ) : (
                        <div>
                            {details ? (
                                <>
                                    <Typography>Email: {details.confessor}</Typography>
                                    <Typography>Confessed {formatTimestamp(confession.timestamps)}</Typography>
                                    <h2>Guessed Info</h2>
                                    <Typography>Guessed Year: {guessYearAndBranch(details.confessor).guessedYear}</Typography>
                                    <Typography>Guessed Branch: {guessYearAndBranch(details.confessor).guessedBranch}</Typography>

                                </>
                            ) : (
                                <Typography>No details available</Typography>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ConfessionFooter;
