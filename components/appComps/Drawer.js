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

export default function SwipeableTemporaryDrawer() {
  const router = useRouter();

  // Separate state variables
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [unseenCount, setUnseenCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [fetching, setFetching] = useState(false);

  const isDrawerOpen = useRef(false);

  // Toggle Drawer
  const toggleDrawer = (open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(open);
    isDrawerOpen.current = open;
  };

  // Fetch User Details
  const fetchUserDetails = async () => {
    try {
      const session = await getSession();
      if (session?.user?.email) {
        const response = await fetch(
          `/api/getdetails/getuserdetails?userEmail=${encodeURIComponent(
            session.user.email
          )}`
        );
        if (response.ok) {
          const data = await response.json();
          setUserDetails(data);
        } else {
          console.error('Failed to fetch user details');
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Fetch Unseen Count
  const fetchUnseenCount = async () => {
    if (userDetails && userDetails.email) {
      try {
        if (fetching) return;
        setFetching(true);
        const response = await fetch(
          `/api/inbox/unseen-count?mid=${encodeURIComponent(userDetails.mid)}`
        );
        if (response.ok) {
          const data = await response.json();
          const totalCount = data.totalUnseenCount1 + data.totalUnseenCount2;
          setUnseenCount(totalCount);
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

  // Handle Navigation
  const handleNavigation = (href, index) => {
    setActiveIndex(index);
    router.push(href);
    setDrawerOpen(false);
  };

  // Fetch user details on mount
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Fetch unseen count when userDetails change
  useEffect(() => {
    if (userDetails) {
      fetchUnseenCount();
      const intervalId = setInterval(fetchUnseenCount, 10000); // 10 seconds
      return () => clearInterval(intervalId);
    }
  }, [userDetails]);

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
    const currentPath = router.asPath; // Remove query params and trailing slash
    const index = paths.findIndex(
      (path) => path === currentPath
    );
    setActiveIndex(index !== -1 ? index : null);
    console.info({currentPath, arrayPathValue: paths[index], index  })
  }, [router.pathname]);

  // Handle back button when drawer is open
  useEffect(() => {
    const handleBeforePopState = ({ url, as, options }) => {
      if (isDrawerOpen.current) {
        setDrawerOpen(false);
        isDrawerOpen.current = false;
        return false;
      }
      return true;
    };

    router.beforePopState(handleBeforePopState);

    return () => {
      router.beforePopState(() => true);
    };
  }, [router]);

  useEffect(()=>{
    console.log({activeIndex})
  },[activeIndex])

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
          ].map((item, index) => 
            {
              console.log('compLog: ', index, activeIndex, activeIndex === index)
              return(
            <ListItem key={item.text} className={styles.sideBarListItem}>
              <Link href={item.href} passHref style={{ width: '100%', textDecoration: 'none' }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.href, index)}
                  className={`${styles.sideBarLinks} ${
                    activeIndex === index ? styles.activeListItem : ''
                  }`}
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
          )})}
        </div>
        {/* Bottom actions (e.g., Logout) */}
        {userDetails && (
          <ListItem>
            <ListItemButton
              className={styles.sideBarListItem}
              onClick={() => {
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
                      fontWeight: '400',
                      fontFamily: 'Jost',
                      width: '100%',
                      fontSize: '1rem',
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
