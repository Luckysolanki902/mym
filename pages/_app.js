import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import SessionProvider from './SessionProvider';
import Topbar from '@/components/appComps/Topbar';
import Sidebar from '@/components/appComps/Sidebar';
import CustomHead from '@/components/seo/CustomHead';
import TypeAdminPassword from '@/components/fullPageComps/TypeAdminPassword';
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

  // Overall loading state (used while we do initial checks)
  const [appLoading, setAppLoading] = useState(true);

  // Loading gif state during route transitions
  const [showLoadingGif, setShowLoadingGif] = useState(false);

  useEffect(() => {
    // Admin page token verification
    const initApp = async () => {
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
      setAppLoading(false);
    };

    initApp();
  }, [isAdminPage]);

  // Listen to route changes for showing a loading GIF
  useEffect(() => {
    let timeout;
    const handleRouteChangeStart = () => {
      setShowLoadingGif(true);
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
