import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './styles/sidebar.module.css';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(null);

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
          className={`${styles.icons} ${activeIndex === 0 ? styles.active : ''}`}
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
      </div>
    </div>
  );
};

export default Sidebar;
