import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Image from 'next/image';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import SessionProvider from './SessionProvider';
import Topbar from '@/components/appComps/Topbar';
import Sidebar from '@/components/appComps/Sidebar';
import CustomHead from '@/components/seo/CustomHead';
import TypeAdminPassword from '@/components/fullPageComps/TypeAdminPassword';
import ComingSoon from '@/components/fullPageComps/ComingSoon';
import SoothingLoader from '@/components/loadings/SoothingLoader';

import { store, persistor } from '@/store/store';
import '@/styles/globals.css';
import GoogleAnalytics from '@/components/seo/GoogleAnalytics';

const mymtheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(45, 45, 45)',
    },
  },
});

const mymthemeDark = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgb(255, 255, 255)',
    },
  },
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const pageSeo = Component?.seo || pageProps?.seo || null;

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const isAdminPage = router.pathname.startsWith('/admin');

  // Coming soon state
  const [showComingSoonPage, setShowComingSoonPage] = useState(true);

  // Overall loading state (used while we do initial checks)
  const [appLoading, setAppLoading] = useState(true);

  // Loading gif state during route transitions
  const [showLoadingGif, setShowLoadingGif] = useState(false);

  // Launch date/time
  const launchDateNTime = new Date('30 Dec, 2024 18:00:00 GMT+0530').getTime();

  useEffect(() => {
    // Custom cursor effect
    // Only enable on large screens with a fine pointer (mouse)
    if (typeof window === 'undefined') return;
    
    const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth < 800;
    
    if (isCoarsePointer || isSmallScreen) {
      return;
    }

    const cursor = document.createElement('div');
    
    // Minimal Gen Z aesthetic arrow (Black with white outline)
    const svgCursor = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L10.5 20.5L13.5 13.5L20.5 10.5L3 3Z" fill="black" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    `;
    const encodedSvg = encodeURIComponent(svgCursor);

    cursor.style.cssText = `
      position: fixed;
      width: 24px;
      height: 24px;
      pointer-events: none;
      z-index: 99999;
      background-image: url("data:image/svg+xml;charset=utf-8,${encodedSvg}");
      background-size: contain;
      background-repeat: no-repeat;
      top: 0;
      left: 0;
      display: none;
    `;
    document.body.appendChild(cursor);

    const updateCursor = (e) => {
      cursor.style.display = 'block';
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    document.addEventListener('mousemove', updateCursor);
    
    return () => {
      document.removeEventListener('mousemove', updateCursor);
      if (cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
    };
  }, []);

  useEffect(() => {
    // Combined Initialization
    // 1. Check if the site is launched yet
    // 2. If on an admin route, verify the token
    // Until done, show a loading screen

    const initApp = async () => {
      // 1) Check if site has launched
      const now = new Date().getTime();
      if (now >= launchDateNTime) {
        setShowComingSoonPage(false);
      } else {
        // If not launched, set up an interval to check every second or so
        const intervalId = setInterval(() => {
          const updatedTime = new Date().getTime();
          if (updatedTime >= launchDateNTime) {
            setShowComingSoonPage(false);
            clearInterval(intervalId);
          }
        }, 1000);
      }

      // 2) If on admin page, verify token
      if (isAdminPage) {
        try {
          const token = localStorage.getItem('adminAuthToken');
          if (token) {
            const response = await fetch('/api/admin/security/authenticate', {
              method: 'GET',
              headers: {
                Authorization: token,
              },
            });
            const data = await response.json();
            if (data.success) {
              setIsAdminLoggedIn(true);
            } else {
              localStorage.removeItem('adminAuthToken');
            }
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('adminAuthToken');
        }
      }

      // Once checks are done, hide the initial loading screen
      setAppLoading(false);
    };

    initApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to route changes for showing a loading GIF
  useEffect(() => {
    let timeout;
    const handleRouteChangeStart = () => {
      setShowLoadingGif(true);
      // Set a timeout so the loading doesn't get stuck
      // in case route change fails for some reason
      timeout = setTimeout(() => {
        setShowLoadingGif(false);
      }, 10000);
    };
    const handleRouteChangeComplete = () => {
      clearTimeout(timeout);
      setShowLoadingGif(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      clearTimeout(timeout);
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  // -------------
  //   RENDERING
  // -------------

  // If still performing initial checks, show a simple loading screen
  if (appLoading) {
    return (
      <ThemeProvider theme={mymtheme}>
        <CssBaseline />
        <CustomHead {...(pageSeo || {})} />
        <SoothingLoader />
      </ThemeProvider>
    );
  }

  // If on admin page:
  if (isAdminPage) {
    return (
      <ThemeProvider theme={mymthemeDark}>
        <CssBaseline />
        <CustomHead {...(pageSeo || {})} />
        {isAdminLoggedIn ? (
          <Component {...pageProps} />
        ) : (
          <TypeAdminPassword onLogin={() => setIsAdminLoggedIn(true)} />
        )}
      </ThemeProvider>
    );
  }

  // Non-admin pages:
  // If ComingSoon is active, show it
  if (showComingSoonPage) {
    return (
      <ThemeProvider theme={mymtheme}>
        <CssBaseline />
        <CustomHead {...(pageSeo || {})} />
        <ComingSoon />
      </ThemeProvider>
    );
  }

  // Otherwise, render the actual site
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionProvider>
          <ThemeProvider theme={mymtheme}>
            <CssBaseline />
            <GoogleAnalytics />
            <CustomHead {...(pageSeo || {})} />
            <Topbar />
            <Sidebar />
            {showLoadingGif && <SoothingLoader />}
            <div
              style={{
                paddingTop: 'var(--topbarheight)',
                paddingLeft: '0',
                minHeight: '100vh',
                width: '100%',
              }}
            >
              <Component {...pageProps} />
            </div>
          </ThemeProvider>
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
}
