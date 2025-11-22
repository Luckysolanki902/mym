import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import SwipeableTemporaryDrawer from '@/components/appComps/Drawer';
import styles from './styles/topbar.module.css';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';

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
      <Image 
        onClick={() => router.push('/')} 
        src={'/images/spyll_logos/spyll_black_logo.png'} 
        width={724 / 3} 
        height={338 / 3} 
        alt='mym' 
        className={styles.brandmark}
      />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {user && <SwipeableTemporaryDrawer />}
        {!loading && !user && (
          <div className={styles.sessionButtons}>
            {/* {isSignUpPage && (
              <button className={styles.login} onClick={handleSignIn}>Log In Instead</button>
            )}
            {isSignInPage && (
              <button className={styles.login} onClick={handleSignUp}>Sign Up Instead</button>
            )} */}
            {!isSignUpPage && !isSignInPage && (
              <>
                <button className={styles.login} onClick={handleSignIn}>Login</button>
                {/* <button className={styles.signup} onClick={handleSignUp}>Sign Up</button> */}
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
