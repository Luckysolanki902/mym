import React, { useEffect, useState } from 'react';
import SwipeableTemporaryDrawer from '@/components/appComps/Drawer';
import styles from './styles/topbar.module.css';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import SpyllWordmark from '@/components/commonComps/SpyllWordmark';

const Topbar = () => {
  const router = useRouter();
  // Use the hook instead of async getSession - this doesn't block render
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const user = session?.user || null;

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
