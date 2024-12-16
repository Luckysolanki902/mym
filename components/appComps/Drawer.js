import React, { useState, useEffect, useRef } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
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
import { getSession, signOut } from 'next-auth/react';

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
        activeIndex: null,
    });
    const [fetching, setFetching] = useState(false);

    const isDrawerOpen = useRef(false);

    const toggleDrawer = (anchor, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState((prevState) => ({ ...prevState, [anchor]: open }));
        isDrawerOpen.current = open;
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
                if (fetching) return;
                setFetching(true);
                const response = await fetch(`/api/inbox/unseen-count?mid=${userDetails?.mid}`);
                if (response.ok) {
                    const data = await response.json();
                    const totalCount = data.totalUnseenCount1 + data.totalUnseenCount2;
                    setState((prevState) => ({ ...prevState, unseenCount: totalCount }));
                } else {
                    console.error('Failed to fetch unseen count');
                }
            } catch (error) {
                console.error('Error fetching unseen count:', error);
            } finally {
                setFetching(false);
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
        const paths = ['/', '/textchat', '/all-confessions', '/create-confession', '/inbox', '/give-your-suggestion'];
        const currentPath = router.pathname.split('?')[0]; // Remove query parameters
        const index = paths.findIndex((path) => path === currentPath);
        setState((prevState) => ({ ...prevState, activeIndex: index !== -1 ? index : null }));
        console.log(index);
    }, [router.pathname]);

    useEffect(() => {
        router.beforePopState(({ url, as, options }) => {
            if (isDrawerOpen.current) {
                setState((prevState) => ({ ...prevState, right: false }));
                isDrawerOpen.current = false;
                return false;
            }
            return true;
        });

        return () => {
            router.beforePopState(() => true);
        };
    }, [router]);

    const list = (anchor) => (
        <div className={styles.MainCont} role="presentation">
            <div className={styles.imageCont}>
                <Image
                    className={styles.logoImage}
                    src={'/images/mym_logos/mymlogoinvert2.png'}
                    width={724 / 2}
                    height={338 / 2}
                    alt="mym"
                    title="maddy logo"
                />
            </div>
            <List className={styles.list} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxHeight:'60vh', overflowY:'auto' }}>
                    {[
                        { text: 'Home', href: '/' },
                        { text: 'Random Chat', href: '/textchat' },
                        { text: 'Read Confessions', href: '/all-confessions' },
                        { text: 'Write Confession', href: '/create-confession' },
                        { text: 'Inbox', href: '/inbox' },
                        { text: 'Suggestions', href: '/give-your-suggestion' },
                    ].map((item, index) => (
                        <ListItem key={item.text} className={styles.sideBarListItem}>
                            <Link href={item.href} passHref style={{ width: '100%', textDecoration: 'none' }}>
                                <ListItemButton onClick={() => { setTimeout(() => toggleDrawer('right', false)(), 1000) }} className={`${styles.sideBarLinks} ${state.activeIndex === index ? styles.activeListItem : ''}`}>
                                    <ListItemIcon className={styles.listItemIcon}>
                                        {index === 0 ? (
                                            <Image
                                                src={'/images/sidebaricons/home.png'}
                                                width={512 / 3}
                                                height={512 / 3}
                                                alt="icon"
                                                className={`${styles.iconspng1} ${styles.sideIcon}`}
                                            />
                                        ) : index === 1 ? (
                                            <Image
                                                src={'/images/sidebaricons/randomchat.png'}
                                                width={1080 / 10}
                                                height={720 / 10}
                                                alt="icon"
                                                className={`${styles.iconspng2} ${styles.sideIcon}`}
                                            />
                                        ) : index === 2 ? (
                                            <Image
                                                src={'/images/sidebaricons/confessions.png'}
                                                width={545 / 10}
                                                height={720 / 10}
                                                alt="icon"
                                                className={`${styles.iconspng3} ${styles.sideIcon}`}
                                            />
                                        ) : index === 3 ? (
                                            <Image
                                                src={'/images/sidebaricons/createconfession.png'}
                                                width={225 / 2}
                                                height={272 / 2}
                                                alt="icon"
                                                className={`${styles.iconspng4} ${styles.sideIcon}`}
                                            />
                                        ) : index === 4 ? (
                                            <StyledBadge badgeContent={state.unseenCount} color="primary">
                                                <MailIcon fontSize="medium" style={{ color: 'white' }} />
                                            </StyledBadge>
                                        ) : index === 5 ? (
                                            <Image
                                                src={'/images/sidebaricons/bulb.png'}
                                                width={300 / 2}
                                                height={272 / 2}
                                                alt="icon"
                                                className={`${styles.iconspng5} ${styles.sideIcon}`}
                                            />
                                        ) : null}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<div className={styles.linkText}>{item.text}</div>}
                                        className={styles.link}
                                    />
                                </ListItemButton>
                            </Link>
                        </ListItem>
                    ))}
                </div>
                {/* Bottom actions (e.g., Logout) */}
                {state.userDetails && (
                    <ListItem>
                        <ListItemButton className={styles.sideBarListItem} onClick={signOut}>
                            <ListItemIcon className={styles.listItemIcon}>
                                <Image
                                    src={'/images/sidebaricons/logout.png'}
                                    width={300 / 2}
                                    height={272 / 2}
                                    alt="logout icon"
                                    className={`${styles.iconspng5} ${styles.sideIcon}`}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <div style={{ color: 'white', fontWeight:'500', fontFamily:'Jost', width:'100%', fontSize:'1.2rem' }} className={styles.linkText}>
                                        Logout
                                    </div>
                                }
                                className={styles.link}
                            />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </div>
    );

    return (
        <div className={styles.drawermain}>
            <button
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    padding: '0',
                    margin: '0',
                    outline: 'none',
                    border: 'none'
                }}
                onClick={toggleDrawer('right', true)}
            >
                <MenuIcon className={styles.menuIcon} style={{ fontSize: '40px' }} />
            </button>
            <SwipeableDrawer
                anchor="right"
                open={state.right}
                onClose={toggleDrawer('right', false)}
                onOpen={toggleDrawer('right', true)}
                className={styles.swipeableDrawer}
            >
                {list('right')}
            </SwipeableDrawer>
        </div>
    );
}
