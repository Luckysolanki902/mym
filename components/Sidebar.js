import React, { useState } from 'react';
import Image from 'next/image';
import styles from '@/components/componentStyles/sidebar.module.css';
import Router, { useRouter } from 'next/router';
const Sidebar = () => {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSetActive = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className='sidebarvisibility'>
      <div className={`${styles.mainSidebarDiv} sidebardim`}>
        <div
          className={`${styles.icons} ${activeIndex === 0 ? styles.active : ''}`}
          onClick={() => {handleSetActive(0); router.push('/')}}
        >
          <Image
            src={'/images/sidebaricons/home.png'}
            width={512/3}
            height={512/3}
            alt='icon'
            className={styles.iconspng1}
          />
        </div>
        <div
          className={`${styles.icons} ${activeIndex === 1 ? styles.active : ''}`}
          onClick={() => {handleSetActive(1); router.push('/textchat')}}
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
          onClick={() => {handleSetActive(2); router.push('/all-confessions')}}
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
          onClick={() => {handleSetActive(3); router.push('/create-confession')}}
        >
          <Image
            src={'/images/sidebaricons/createconfession.png'}
            width={225/ 2}
            height={272/ 2}
            alt='icon'
            className={styles.iconspng4}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
