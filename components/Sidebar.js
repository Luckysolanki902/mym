import React, { useState } from 'react';
import Image from 'next/image';
import styles from '@/components/componentStyles/sidebar.module.css';

const Sidebar = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSetActive = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className={`${styles.mainSidebarDiv} sidebarwidth`}>
      <div
        className={`${styles.icons} ${activeIndex === 0 ? styles.active : ''}`}
        onClick={() => handleSetActive(0)}
      >
        <Image
          src={'/images/sidebaricons/randomchat.png'}
          width={1080 / 10}
          height={720 / 10}
          alt='icon'
          className={styles.iconspng}
        />
      </div>
      <div
        className={`${styles.icons} ${activeIndex === 1 ? styles.active : ''}`}
        onClick={() => handleSetActive(1)}
      >
        <Image
          src={'/images/sidebaricons/randomchat.png'}
          width={1080 / 10}
          height={720 / 10}
          alt='icon'
          className={styles.iconspng}
        />
      </div>
      <div
        className={`${styles.icons} ${activeIndex === 2 ? styles.active : ''}`}
        onClick={() => handleSetActive(2)}
      >
        <Image
          src={'/images/sidebaricons/randomchat.png'}
          width={1080 / 10}
          height={720 / 10}
          alt='icon'
          className={styles.iconspng}
        />
      </div>
      <div
        className={`${styles.icons} ${activeIndex === 3 ? styles.active : ''}`}
        onClick={() => handleSetActive(3)}
      >
        <Image
          src={'/images/sidebaricons/randomchat.png'}
          width={1080 / 10}
          height={720 / 10}
          alt='icon'
          className={styles.iconspng}
        />
      </div>
    </div>
  );
};

export default Sidebar;
