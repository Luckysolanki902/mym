import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import SessionProvider from './SessionProvider';
import CustomHead from '@/components/seo/CustomHead';

import { store, persistor } from '@/store/store';
import '@/styles/globals.css';

// Dynamic imports for non-critical components (loaded after initial render)
const Topbar = dynamic(() => import('@/components/appComps/Topbar'), { ssr: true });
const Sidebar = dynamic(() => import('@/components/appComps/Sidebar'), { ssr: false });
const GoogleAnalytics = dynamic(() => import('@/components/seo/GoogleAnalytics'), { ssr: false });
const SoothingLoader = dynamic(() => import('@/components/loadings/SoothingLoader'), { ssr: false });
const TypeAdminPassword = dynamic(() => import('@/components/fullPageComps/TypeAdminPassword'), { ssr: false });
const PushNotificationInit = dynamic(() => import('@/components/utils/PushNotificationInit'), { ssr: false });

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

  // Only show loading for admin pages (non-admin pages render immediately)
  const [adminLoading, setAdminLoading] = useState(isAdminPage);

  // Loading gif state during route transitions
  const [showLoadingGif, setShowLoadingGif] = useState(false);

  useEffect(() => {
    // Admin page token verification - only runs for admin pages
    if (!isAdminPage) return;
    
    const verifyAdmin = async () => {
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
      setAdminLoading(false);
    };

    verifyAdmin();
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

  // If on admin page and still verifying:
  if (isAdminPage && adminLoading) {
    return (
      <ThemeProvider theme={mymthemeDark}>
        <CssBaseline />
        <CustomHead {...(pageSeo || {})} />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          background: '#121212',
          color: '#fff',
          fontFamily: 'Inter, sans-serif'
        }}>
          Loading...
        </div>
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
            <PushNotificationInit />
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
