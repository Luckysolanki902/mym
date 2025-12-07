import React, { useEffect, useState } from 'react';
import SwipeableTemporaryDrawer from '@/components/appComps/Drawer';
import styles from './styles/topbar.module.css';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import SpyllWordmark from '@/components/commonComps/SpyllWordmark';

const Topbar = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const isSignUpPage = router.pathname === '/auth/signup';
  const isSignInPage = router.pathname === '/auth/signin';

  return (
    <div className={`topbarheight ${styles.mainDiv}`}>
      <SpyllWordmark
        onClick={() => router.push('/')}
        className={styles.brandmark}
        style={{
          fontSize: '2rem',
          color: '#000000',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {user && <SwipeableTemporaryDrawer />}
        {!loading && !user && (
          <div className={styles.sessionButtons}>
            {!isSignUpPage && !isSignInPage && (
              <>
                <button className={styles.login} onClick={handleSignIn}>Login</button>
              </>
            )}
            {<SwipeableTemporaryDrawer />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
