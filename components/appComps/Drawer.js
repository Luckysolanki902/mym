// components/SwipeableTemporaryDrawer.js

import React, { useState, useEffect, useRef } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Link from 'next/link';
import Image from 'next/image';
import styles from './styles/topbar.module.css';
import sidebarStyles from './styles/sidebar.module.css';
import Badge from '@mui/material/Badge';
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

export default function SwipeableTemporaryDrawer() {
  const router = useRouter();

  // State variables
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [unseenCount, setUnseenCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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

    if (!open) {
      // Handle closing animation
      handleClose();
    } else {
      setDrawerOpen(true);
      isDrawerOpen.current = true;
      setIsClosing(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    // Wait for exit animation to finish before closing drawer
    setTimeout(() => {
      setDrawerOpen(false);
      isDrawerOpen.current = false;
      setIsClosing(false);
    }, 250);
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
    handleClose();
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
    const navPaths = [
      '/',
      '/random-chat',
      '/random-call',
      '/all-confessions',
      '/create-confession',
      '/inbox',
      '/give-your-suggestion',
      '/settings',
    ];
    const currentPath = router.asPath.split('?')[0].replace(/\/$/, '') || '/';
    const index = navPaths.findIndex((path) => {
      if (path === '/settings') {
        return currentPath.startsWith('/settings');
      }
      return path === currentPath;
    });
    setActiveIndex(index !== -1 ? index : null);
  }, [router.asPath]);

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

  // Custom Hamburger (Trigger) - Gen-Z animated version
  const HamburgerTrigger = ({ onClick }) => (
    <button 
      onClick={onClick}
      className={styles.hamburgerButton}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '0.6rem',
        margin: '0',
        outline: 'none',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '0.9rem',
        cursor: 'pointer',
        width: '42px',
        height: '42px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '4px',
        width: '20px',
      }}>
        <span style={{
          width: '18px', 
          height: '2.5px',
          background: 'rgba(60, 60, 60, 0.85)',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
        }} />
        <span style={{
          width: '14px', 
          height: '2.5px',
          background: 'rgba(60, 60, 60, 0.85)',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
        }} />
        <span style={{
          width: '10px', 
          height: '2.5px',
          background: 'rgba(60, 60, 60, 0.85)',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
        }} />
      </div>
    </button>
  );

  // Custom Cross (Close Button) - Gen-Z style
  const CloseButton = ({ onClick }) => (
    <div 
      className={`${sidebarStyles.closeButton} ${isClosing ? sidebarStyles.dockExit : ''}`}
      style={{ 
        position: 'absolute',
        top: '20px', 
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
        border: '1px solid rgba(255,255,255,0.6)',
        pointerEvents: 'auto',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      onClick={onClick}
    >
      <div style={{ position: 'relative', width: '16px', height: '16px' }}>
        <span style={{
          position: 'absolute', top: '7px', left: '0', width: '16px', height: '2px',
          background: 'rgba(60, 60, 60, 0.85)',
          transform: 'rotate(45deg)', borderRadius: '4px',
          transition: 'all 0.3s ease'
        }} />
        <span style={{
          position: 'absolute', top: '7px', left: '0', width: '16px', height: '2px',
          background: 'rgba(60, 60, 60, 0.85)',
          transform: 'rotate(-45deg)', borderRadius: '4px',
          transition: 'all 0.3s ease'
        }} />
      </div>
    </div>
  );

  const list = () => (
    <div 
      role="presentation" 
      className={isClosing ? sidebarStyles.dockExit : ''}
      style={{ 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        position: 'relative'
      }}
    >
      {/* Wrapper to align button and dock */}
      <div style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '1rem'
      }}>
        {/* Close Button separated from dock */}
        <CloseButton onClick={handleClose} />

        <div 
          className={sidebarStyles.mobileDockContainer}
          style={{ pointerEvents: 'auto' }} // Re-enable pointer events for the dock
        >
          {[
            { text: 'Home', href: '/', icon: '/images/sidebaricons/home.png', width: 512/3, height: 512/3, className: sidebarStyles.iconspng1 },
            { text: 'Random Chat', href: '/random-chat', icon: '/images/sidebaricons/randomchat.png', width: 1080/10, height: 720/10, className: sidebarStyles.iconspng2 },
            { text: 'Random Call', href: '/random-call', icon: '/images/sidebaricons/random_call_black3.png', width: 1080/10, height: 720/10, className: sidebarStyles.iconspng2, style: {transform: `scale(0.9) translateY(3px)`} },
            { text: 'Read Confessions', href: '/all-confessions', icon: '/images/sidebaricons/confessions.png', width: 545/10, height: 720/10, className: sidebarStyles.iconspng3 },
            { text: 'Write Confession', href: '/create-confession', icon: '/images/sidebaricons/createconfession.png', width: 225/2, height: 272/2, className: sidebarStyles.iconspng4 },
            { text: 'Inbox', href: '/inbox', icon: '/images/sidebaricons/inbox.png', width: 225/2, height: 272/2, className: sidebarStyles.iconspng4, isBadge: true },
            { text: 'Suggestions', href: '/give-your-suggestion', icon: '/images/sidebaricons/bulb.png', width: 225/2, height: 272/2, className: sidebarStyles.iconspng4 },
          ].map((item, index) => (
            <div 
              key={index}
              className={sidebarStyles.mobileDockItem}
              onClick={() => handleNavigation(item.href, index)}
            >
              <div className={sidebarStyles.mobileDockLabel}>
                {item.text}
              </div>
              
              <div 
                className={`${sidebarStyles.icons} ${sidebarStyles.mobileDockIcon} ${activeIndex === index ? (index === 0 ? sidebarStyles.activeAndAtHome : sidebarStyles.active) : ''}`}
                style={{ margin: 0 }}
              >
                <div className={sidebarStyles.iconImageSlot}>
                  {item.isBadge ? (
                    <StyledBadge badgeContent={unseenCount} color="primary">
                      <Image
                        src={item.icon}
                        width={item.width}
                        height={item.height}
                        alt='icon'
                        className={item.className}
                        style={item.style}
                      />
                    </StyledBadge>
                  ) : (
                    <Image
                      src={item.icon}
                      width={item.width}
                      height={item.height}
                      alt='icon'
                      className={item.className}
                      style={item.style}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          {userDetails && (
            <div 
              className={sidebarStyles.mobileDockItem}
              onClick={() => handleNavigation('/settings', 7)}
              style={{ marginTop: 'auto' }}
            >
              <div className={sidebarStyles.mobileDockLabel}>
                Settings
              </div>
              <div className={`${sidebarStyles.icons} ${sidebarStyles.mobileDockIcon} ${activeIndex === 7 ? sidebarStyles.active : ''}`}>
                <div className={sidebarStyles.iconImageSlot}>
                  <Image
                    src={'/images/sidebaricons/settings.png'}
                    width={225 / 2}
                    height={272 / 2}
                    alt='icon'
                    style={{transform:'scale(0.9)'}}
                    className={sidebarStyles.iconspng4}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.drawermain}>
      {/* Only show Hamburger when drawer is closed */}
      {!drawerOpen && <HamburgerTrigger onClick={toggleDrawer(true)} />}
      
      <SwipeableDrawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        className={styles.swipeableDrawer}
        PaperProps={{
          style: {
            background: 'transparent',
            boxShadow: 'none',
            width: 'auto',
            overflow: 'visible'
          }
        }}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(4px)'
          }
        }}
        transitionDuration={300}
      >
        {drawerOpen && list()}
      </SwipeableDrawer>
    </div>
  );
}
