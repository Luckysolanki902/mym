// pages/settings.js

import React, { useEffect, useState } from 'react';
import { getSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './settings.module.css';

const SettingsPage = ({ userDetails }) => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const sess = await getSession();
      setSession(sess);
      setIsLoading(false);
    };
    fetchSession();
  }, []);

  const handleLogout = () => {
    signOut();
  };

  // Get background gradient based on user gender
  const getBackgroundGradient = () => {
    if (userDetails?.gender === 'male') {
      return 'linear-gradient(180deg, #e0f7fa 0%, #ffffff 100%)';
    } else if (userDetails?.gender === 'female') {
      return 'linear-gradient(180deg, #fce4ec 0%, #ffffff 100%)';
    }
    return 'linear-gradient(180deg, #fdfbfb 0%, #ebedee 100%)';
  };

  // Get card class based on user gender
  const getCardClass = () => {
    if (userDetails?.gender === 'male') {
      return styles.maleCard;
    } else if (userDetails?.gender === 'female') {
      return styles.femaleCard;
    }
    return styles.neutralCard;
  };

  if (isLoading) {
    return (
      <div className={styles.settingsContainer} style={{ background: getBackgroundGradient() }}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settingsContainer} style={{ background: getBackgroundGradient(), transition: 'background 2.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div className={styles.settingsContent}>
        <h1 className={styles.pageTitle}>Settings</h1>

        {session ? (
          <>
            <div className={`${styles.profileCard} ${getCardClass()}`}>
              {/* <div className={styles.avatarContainer}>
                <Image
                  src={session.user.image || '/images/default-avatar.png'}
                  alt={session.user.name || 'User'}
                  width={100}
                  height={100}
                  className={styles.avatar}
                />
              </div> */}
              <h2 className={styles.userName}>Anonymous</h2>
              <p className={styles.userEmail}>{session.user.email}</p>
            </div>

            {userDetails && (
              <div className={styles.detailsGrid}>
                <div className={`${styles.detailCard} ${getCardClass()}`}>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Gender</span>
                    <span className={styles.detailValue}>{userDetails.gender}</span>
                  </div>
                </div>

                <div className={`${styles.detailCard} ${getCardClass()}`}>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>College</span>
                    <span className={styles.detailValue}>{userDetails.college}</span>
                  </div>
                </div>
              </div>
            )}

            <p className={styles.infoText}>
              You can&apos;t change these details.
            </p>

            <button
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              LOGOUT
            </button>
          </>
        ) : (
          <div className={`${styles.signInCard} ${styles.neutralCard}`}>
            <div className={styles.signInIcon}>🔐</div>
            <h2 className={styles.signInTitle}>You are not logged in</h2>
            <p className={styles.signInText}>Please sign in to access your settings</p>
            <Link href="/api/auth/signin" passHref>
              <button className={styles.signInButton}>
                Sign In
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;



export async function getServerSideProps(context) {
  const session = await getSession(context);
  const pageurl = process.env.NEXT_PUBLIC_PAGEURL;

  let userDetails = null;
  if (session?.user?.email) {
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

  return {
    props: {
      userDetails,
    },
  };
}

