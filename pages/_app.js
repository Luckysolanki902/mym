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
    const cursor = document.createElement('div');
    cursor.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transition: background 0.15s ease;
      mix-blend-mode: normal;
    `;
    document.body.appendChild(cursor);

    const updateCursor = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const screenMidpoint = window.innerWidth / 2;
      
      cursor.style.left = `${x - 4}px`;
      cursor.style.top = `${y - 4}px`;
      
      if (x < screenMidpoint) {
        cursor.style.background = 'rgba(79, 195, 247, 0.9)';
        cursor.style.boxShadow = '0 0 12px rgba(79, 195, 247, 0.6), 0 0 4px rgba(79, 195, 247, 0.8)';
      } else {
        cursor.style.background = 'rgba(236, 64, 122, 0.9)';
        cursor.style.boxShadow = '0 0 12px rgba(236, 64, 122, 0.6), 0 0 4px rgba(236, 64, 122, 0.8)';
      }
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
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            style={{ width: '130px', height: 'auto' }}
            src={'/gifs/rhombus.gif'}
            width={200}
            height={200}
            loading='eager'
            alt='loading'
          />
        </div>
      </ThemeProvider>
    );
  }

  // If on admin page:
  if (isAdminPage) {
    return (
      <ThemeProvider theme={mymthemeDark}>
        <CssBaseline />
        <CustomHead />
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
        <CustomHead />
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
            <CustomHead />
            <Topbar />
            <Sidebar />
            {showLoadingGif && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  zIndex: '999',
                }}
              >
                <Image
                  style={{ width: '120px', height: '120px' }}
                  src={'/gifs/rhombus.gif'}
                  width={200}
                  height={200}
                  alt='loading'
                  loading='eager'
                />
              </div>
            )}
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
