import React, { useState, useEffect, useRef, useCallback } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx'; // Install clsx
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

export default function PhoneDrawer() {
  const router = useRouter();

  // Separate state variables
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [unseenCount, setUnseenCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [fetching, setFetching] = useState(false);

  const isDrawerOpenRef = useRef(false);

  // Toggle Drawer
  const toggleDrawer = useCallback((open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(open);
    isDrawerOpenRef.current = open;
    console.log(`Drawer is now ${open ? 'open' : 'closed'}`);
  }, []);

  // Fetch User Details
  const fetchUserDetails = useCallback(async () => {
    try {
      const session = await getSession();
      console.log('Session:', session);
      if (session?.user?.email) {
        const response = await fetch(
          `/api/getdetails/getuserdetails?userEmail=${encodeURIComponent(
            session.user.email
          )}`
        );
        console.log('Fetching user details response:', response);
        if (response.ok) {
          const data = await response.json();
          console.log('User Details:', data);
          setUserDetails(data);
        } else {
          console.error('Failed to fetch user details:', response.status);
        }
      } else {
        console.warn('No user session found.');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, []);

  // Fetch Unseen Count
  const fetchUnseenCount = useCallback(async () => {
    if (userDetails && userDetails.email) {
      try {
        if (fetching) {
          console.log('Already fetching unseen count.');
          return;
        }
        setFetching(true);
        const response = await fetch(
          `/api/inbox/unseen-count?mid=${encodeURIComponent(userDetails.mid)}`
        );
        console.log('Fetching unseen count response:', response);
        if (response.ok) {
          const data = await response.json();
          const totalCount = data.totalUnseenCount1 + data.totalUnseenCount2;
          console.log('Unseen Count:', totalCount);
          setUnseenCount(totalCount);
        } else {
          console.error('Failed to fetch unseen count:', response.status);
        }
      } catch (error) {
        console.error('Error fetching unseen count:', error);
      } finally {
        setFetching(false);
      }
    } else {
      console.warn('User details not available for fetching unseen count.');
    }
  }, [userDetails, fetching]);

  // Handle Navigation
  const handleNavigation = useCallback((href, index) => {
    console.log(`Navigating to ${href} with index ${index}`);
    setActiveIndex(index);
    router.push(href).then(() => {
      setDrawerOpen(false);
      console.log(`Navigation to ${href} complete, drawer closed.`);
    });
  }, [router]);

  // Fetch user details on mount
  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Fetch unseen count when userDetails change
  useEffect(() => {
    if (userDetails) {
      fetchUnseenCount();
      const intervalId = setInterval(fetchUnseenCount, 10000); // 10 seconds
      return () => clearInterval(intervalId);
    }
  }, [userDetails, fetchUnseenCount]);

  // Set activeIndex based on current path
  useEffect(() => {
    const paths = [
      '/',
      '/textchat',
      '/all-confessions',
      '/create-confession',
      '/inbox',
      '/give-your-suggestion',
    ];
    const currentPath = router.pathname.split('?')[0].replace(/\/$/, '').toLowerCase();
    const index = paths.findIndex(
      (path) => path.replace(/\/$/, '').toLowerCase() === currentPath
    );
    console.info({ currentPath, arrayPathValue: paths[index], index });
    setActiveIndex(index !== -1 ? index : null);
  }, [router.pathname]);

  // Handle back button when drawer is open
  useEffect(() => {
    const handleBeforePopState = ({ url, as, options }) => {
      if (isDrawerOpenRef.current) {
        console.log('Closing drawer due to back navigation.');
        setDrawerOpen(false);
        isDrawerOpenRef.current = false;
        return false;
      }
      return true;
    };

    router.beforePopState(handleBeforePopState);

    return () => {
      router.beforePopState(() => true);
    };
  }, [router]);

  const list = () => (
    <div className={styles.MainCont} role="presentation">
      <div className={styles.imageCont}>
        <Image
          className={styles.logoImage}
          src={'/images/mym_logos/mymlogoinvert2.png'}
          width={362}
          height={169}
          alt="mym"
          title="maddy logo"
        />
      </div>
      <List
        className={styles.list}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            width: '100%',
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
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
                <ListItemButton
                  onClick={() => handleNavigation(item.href, index)}
                  className={clsx(styles.sideBarLinks, {
                    [styles.activeListItem]: activeIndex === index,
                  })}
                >
                  <ListItemIcon className={styles.listItemIcon}>
                    {index === 0 ? (
                      <Image
                        src={'/images/sidebaricons/home.png'}
                        width={170}
                        height={170}
                        alt="icon"
                        className={`${styles.iconspng1} ${styles.sideIcon}`}
                      />
                    ) : index === 1 ? (
                      <Image
                        src={'/images/sidebaricons/randomchat.png'}
                        width={108}
                        height={72}
                        alt="icon"
                        className={`${styles.iconspng2} ${styles.sideIcon}`}
                      />
                    ) : index === 2 ? (
                      <Image
                        src={'/images/sidebaricons/confessions.png'}
                        width={54.5}
                        height={72}
                        alt="icon"
                        className={`${styles.iconspng3} ${styles.sideIcon}`}
                      />
                    ) : index === 3 ? (
                      <Image
                        src={'/images/sidebaricons/createconfession.png'}
                        width={112.5}
                        height={136}
                        alt="icon"
                        className={`${styles.iconspng4} ${styles.sideIcon}`}
                      />
                    ) : index === 4 ? (
                      <StyledBadge badgeContent={unseenCount} color="primary">
                        <MailIcon fontSize="medium" style={{ color: 'white' }} />
                      </StyledBadge>
                    ) : index === 5 ? (
                      <Image
                        src={'/images/sidebaricons/bulb.png'}
                        width={150}
                        height={136}
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
        {userDetails && (
          <ListItem>
            <ListItemButton
              className={styles.sideBarListItem}
              onClick={() => {
                console.log('Signing out.');
                signOut();
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon className={styles.listItemIcon}>
                <Image
                  src={'/images/sidebaricons/logout.png'}
                  width={150}
                  height={136}
                  alt="logout icon"
                  className={`${styles.iconspng5} ${styles.sideIcon}`}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <div
                    style={{
                      color: 'white',
                      fontWeight: '500',
                      fontFamily: 'Jost',
                      width: '100%',
                      fontSize: '1.2rem',
                    }}
                    className={styles.linkText}
                  >
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
          border: 'none',
        }}
        onClick={toggleDrawer(true)}
      >
        <MenuIcon className={styles.menuIcon} style={{ fontSize: '40px' }} />
      </button>
      <SwipeableDrawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        className={styles.swipeableDrawer}
      >
        {list()}
      </SwipeableDrawer>
    </div>
  );
}
