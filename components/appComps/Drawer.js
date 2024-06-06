import React, { useState, useEffect } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import Image from 'next/image';
import styles from './styles/topbar.module.css';
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: -3,
        top: 13,
        border: `2px solid ${theme.palette.background.paper}`,
        padding: '0 4px',
    },
}));

export default function SwipeableTemporaryDrawer(props) {
    const router = useRouter();
    const [state, setState] = useState({
        right: false,
        userDetails: null,
        unseenCount: 0,
        activeIndex: null, // Initially set to null
    });

    const toggleDrawer = (anchor, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setState({ ...state, [anchor]: open });
    };

    const fetchUserDetails = async () => {
        try {
            const session = await getSession();
            if (session?.user?.email) {
                const response = await fetch(`/api/getdetails/getuserdetails?userEmail=${session.user.email}`);
                if (response.ok) {
                    const data = await response.json();
                    setState((prevState) => ({ ...prevState, userDetails: data }));
                } else {
                    console.error('Failed to fetch user details');
                }
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const fetchUnseenCount = async () => {
        const { userDetails } = state;
        if (userDetails && userDetails.email) {
            try {
                const response = await fetch(`/api/inbox/unseen-count?email=${userDetails.email}`);
                if (response.ok) {
                    const data = await response.json();
                    setState((prevState) => ({ ...prevState, unseenCount: data.count }));
                } else {
                    console.error('Failed to fetch unseen count');
                }
            } catch (error) {
                console.error('Error fetching unseen count:', error);
            }
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    useEffect(() => {
        fetchUnseenCount();
        const intervalId = setInterval(fetchUnseenCount, 10000);
        return () => clearInterval(intervalId);
    }, [state.userDetails]);

    useEffect(() => {
        // Check if the path matches any of the Drawer items and set the active index accordingly
        const paths = ['/', '/textchat', '/all-confessions', '/create-confession', '/inbox', '/fill-form'];
        const index = paths.findIndex(path => path === router.pathname);
        setState(prevState => ({ ...prevState, activeIndex: index !== -1 ? index : null }));
    }, [router.pathname]);

    const isActive = (href) => {
        return router.asPath === href;
    };

    const list = (anchor) => (
        <div
            className={styles.MainCont}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <div className={styles.imageCont}>
                <Image className={styles.logoImage} src={'/images/mym_logos/mymlogoinvert2.png'} width={724 / 2} height={338 / 2} alt="mym" title='maddy logo' />
            </div>
            <List className={styles.list} style={{ height: '100%' , }}>
                {[
                    { text: 'Home', href: '/' },
                    { text: 'Random Chat', href: '/textchat' },
                    { text: 'Read Confessions ', href: '/all-confessions' },
                    { text: 'Write Confession', href: '/create-confession' },
                    { text: 'Inbox', href: '/inbox' },
                    { text: 'Suggestions', href: '/fill-form' }, // New option added
                ].map((item, index) => (
                    <ListItem
                        key={item.text}
                        className={`${styles.sideBarListItem} `}
                        style={index === 5 ? { position: 'absolute', bottom: '1rem', } : null}

                    >

                        <Link href={item.href} className={`${styles.sideBarLinks} ${state.activeIndex === index ? styles.activeListItem : ''}`} passHref>
                            <ListItemButton className={styles.sideBarListItem}>
                                <ListItemIcon className={styles.listItemIcon}>
                                    {index === 0 ? (
                                        <Image
                                            src={'/images/sidebaricons/home.png'}
                                            width={512 / 3}
                                            height={512 / 3}
                                            alt='icon'
                                            className={`${styles.iconspng1} ${styles.sideIcon}`}
                                        />
                                    ) : index === 1 ? (
                                        <Image
                                            src={'/images/sidebaricons/randomchat.png'}
                                            width={1080 / 10}
                                            height={720 / 10}
                                            alt='icon'
                                            className={`${styles.iconspng2} ${styles.sideIcon}`}
                                        />
                                    ) : index === 2 ? (
                                        <Image
                                            src={'/images/sidebaricons/confessions.png'}
                                            width={545 / 10}
                                            height={720 / 10}
                                            alt='icon'
                                            className={`${styles.iconspng3} ${styles.sideIcon}`}
                                        />
                                    ) : index === 3 ? (
                                        <Image
                                            src={'/images/sidebaricons/createconfession.png'}
                                            width={225 / 2}
                                            height={272 / 2}
                                            alt='icon'
                                            className={`${styles.iconspng4} ${styles.sideIcon}`}
                                        />
                                    ) : index === 4 ? (
                                        <StyledBadge badgeContent={state.unseenCount} color="primary">
                                            <MailIcon fontSize='medium' style={{ color: 'white' }} />
                                        </StyledBadge>
                                    ) : (
                                        <Image
                                            src={'/images/sidebaricons/bulb.png'}
                                            width={300 / 2}
                                            height={272 / 2}
                                            alt='icon'
                                            className={`${styles.iconspng5} ${styles.sideIcon}`}
                                        />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <h3 className={styles.linkText}>
                                            {item.text}
                                        </h3>
                                    }
                                    className={styles.link}
                                />
                            </ListItemButton>
                        </Link>
                    </ListItem>
                ))}
            </List>
        </div>
    );


    return (
        <div className={styles.drawermain}>
            <Button
                onClick={toggleDrawer('right', true)}
                startIcon={<MenuIcon className={styles.menuIcon} style={{ fontSize: '40px' }} />}
            >
            </Button>
            <SwipeableDrawer
                anchor="right"
                open={state['right']}
                onClose={toggleDrawer('right', false)}
                onOpen={toggleDrawer('right', true)}
                className={styles.swipeableDrawer}
            >
                {list('right')}
            </SwipeableDrawer>
        </div>
    );
}
