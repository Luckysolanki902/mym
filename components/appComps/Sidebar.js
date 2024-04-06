import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Badge } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import styles from './styles/sidebar.module.css';

const Sidebar = ({ userDetails }) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(null);
  const [unseenCount, setUnseenCount] = useState(() => {
    // Check if localStorage is available
    if (typeof localStorage !== 'undefined') {
      // Load unseen count from local storage
      const count = localStorage.getItem('unseenCount');
      return count ? parseInt(count) : 0;
    }
    return 0;
  });

  useEffect(() => {
    const fetchUnseenCount = async () => {
      if (userDetails && userDetails.email) {
        try {
          const response = await fetch(`/api/inbox/unseen-count?email=${userDetails.email}`);
          console.log(`/api/inbox/unseen-count?email=${userDetails.email}`)
          if (response.ok) {
            const data = await response.json();
            const newCount = data.count;
            if (newCount !== unseenCount) {
              // Update unseen count
              setUnseenCount(newCount);
              // Store new count in local storage
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('unseenCount', newCount);
              }
            }
          } else {
            console.error('Failed to fetch unseen count');
          }
        } catch (error) {
          console.error('Error fetching unseen count:', error);
        }
      }
    };

    // Fetch unseen count initially
    fetchUnseenCount();

    // Fetch unseen count every 30 seconds
    const intervalId = setInterval(fetchUnseenCount, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [userDetails]);

  useEffect(() => {
    // Set activeIndex based on the current route
    const path = router.pathname;
    switch (path) {
      case '/':
        setActiveIndex(0);
        break;
      case '/textchat':
        setActiveIndex(1);
        break;
      case '/all-confessions':
        setActiveIndex(2);
        break;
      case '/create-confession':
        setActiveIndex(3);
        break;
      case '/inbox':
        setActiveIndex(4);
        break;
      default:
        setActiveIndex(0);
    }
  }, [router.pathname]);

  const handleSetActive = (index, path) => {
    setActiveIndex(index);
    router.push(path);
  };

  return (
    <div className='sidebarvisibility'>
      <div className={`${styles.mainSidebarDiv} sidebardim`}>
      <div
          className={`${styles.icons} ${activeIndex === 0 ? styles.activeAndAtHome : ''}`}
          onClick={() => handleSetActive(0, '/')}
        >
          <Image
            src={'/images/sidebaricons/home.png'}
            width={512 / 3}
            height={512 / 3}
            alt='icon'
            className={styles.iconspng1}
          />
        </div>
        <div
          className={`${styles.icons} ${activeIndex === 1 ? styles.active : ''}`}
          onClick={() => handleSetActive(1, '/textchat')}
        >
          <Image
            src={'/images/sidebaricons/randomchat.png'}
            width={1080 / 10}
            height={720 / 10}
            alt='icon'
            className={styles.iconspng2}
          />
        </div>
        <div
          className={`${styles.icons} ${activeIndex === 2 ? styles.active : ''}`}
          onClick={() => handleSetActive(2, '/all-confessions')}
        >
          <Image
            src={'/images/sidebaricons/confessions.png'}
            width={545 / 10}
            height={720 / 10}
            alt='icon'
            className={styles.iconspng3}
          />
        </div>
        <div
          className={`${styles.icons} ${activeIndex === 3 ? styles.active : ''}`}
          onClick={() => handleSetActive(3, '/create-confession')}
        >
          <Image
            src={'/images/sidebaricons/createconfession.png'}
            width={225 / 2}
            height={272 / 2}
            alt='icon'
            className={styles.iconspng4}
          />
        </div>
        <div
          className={`${styles.icons} ${activeIndex === 4 ? styles.active : ''}`}
          onClick={() => handleSetActive(4, '/inbox')}
        >
          <Badge badgeContent={unseenCount} color="error">
            <MailIcon />
          </Badge>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = 'https://www.meetyourmate.in';
  let userDetails = null;

  if (session) {
    const email = session?.user?.email;
    if (email) {
      // getting details
        try {
          const response = await fetch(`${pageurl}/api/getdetails/getuserdetails?userEmail=${session.user.email}`);
          if (response.ok) {
            userDetails = await response.json();
          } else {
            console.error('Error fetching user details');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
    }
  }

  return {
    props: {
      userDetails,
    },
  };
}

export default Sidebar;
