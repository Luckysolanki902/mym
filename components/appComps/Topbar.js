import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import SwipeableTemporaryDrawer from '@/components/appComps/Drawer';
import styles from './styles/topbar.module.css';
import { useRouter } from 'next/router';

const Topbar = () => {
  const { data: session, status } = useSession();
  const [showAuthButtons, setShowAuthButtons] = useState(false);
  const router = useRouter()
  useEffect(() => {
    if (status === 'loading') {
      // Session loading, do nothing
    } else if (!session) {
      // No session, show auth buttons
      setShowAuthButtons(true);
    } else {
      // User is authenticated, hide auth buttons
      setShowAuthButtons(false);
    }
  }, [session, status]);


  return (
    <div className={`topbarheight ${styles.mainDiv}`}>
      <Image src={'/images/mym_logos/mymlogoinvert2.png'} width={724 / 3} height={338 / 3} alt='mym' style={{ height: '60%', width: 'auto' }} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {
          !showAuthButtons &&
          <SwipeableTemporaryDrawer />

        }
        {showAuthButtons && (
          <div className={styles.sessionButtons}>
            {/* Render your sign-up and sign-in buttons here */}
            <button className={styles.login} onClick={() => router.push('/auth/signin')}>Login</button>
            <button className={styles.signup} onClick={() => router.push('/auth/signup')}>Sign Up</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
