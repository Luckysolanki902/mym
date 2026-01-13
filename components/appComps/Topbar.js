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
      
      {/* Right side controls - login button and drawer */}
      <div className={styles.rightControls}>
        {/* Show login button only when not logged in and not on auth pages */}
        {!loading && !user && !isSignUpPage && !isSignInPage && (
          <button className={styles.login} onClick={handleSignIn}>Login</button>
        )}
        {/* Always show drawer (it handles logged in/out states internally) */}
        <SwipeableTemporaryDrawer />
      </div>
    </div>
  );
};

export default Topbar;
