import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import MailIcon from '@mui/icons-material/Mail';
import Image from 'next/image';
import styles from './styles/sidebar.module.css';
import { getSession } from 'next-auth/react';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const Sidebar = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [unseenCount, setUnseenCount] = useState(0);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const session = await getSession();
        if (session?.user?.email) {
          const response = await fetch(`/api/getdetails/getuserdetails?userEmail=${session.user.email}`);
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

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchUnseenCount = async () => {
      if (userDetails && userDetails.email) {
        try {
          const response = await fetch(`/api/inbox/unseen-count?email=${userDetails.email}`);
          if (response.ok) {
            const data = await response.json();
            setUnseenCount(data.count);
          } else {
            console.error('Failed to fetch unseen count');
          }
        } catch (error) {
          console.error('Error fetching unseen count:', error);
        }
      }
    };

    fetchUnseenCount();
    const intervalId = setInterval(fetchUnseenCount, 30000);
    return () => clearInterval(intervalId);
  }, [userDetails]);

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
          <StyledBadge badgeContent={unseenCount} color="primary">
            <MailIcon fontSize='large' />
          </StyledBadge>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
