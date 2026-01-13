import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import SessionProvider from './SessionProvider';
import CustomHead from '@/components/seo/CustomHead';
import useMobileOptimizations from '@/hooks/useMobileOptimizations';

import { store, persistor } from '@/store/store';
import '@/styles/globals.css';

// Dynamic imports for non-critical components (loaded after initial render)
const Topbar = dynamic(() => import('@/components/appComps/Topbar'), { ssr: true });
const Sidebar = dynamic(() => import('@/components/appComps/Sidebar'), { ssr: false });
const GoogleAnalytics = dynamic(() => import('@/components/seo/GoogleAnalytics'), { ssr: false });
const SoothingLoader = dynamic(() => import('@/components/loadings/SoothingLoader'), { ssr: false });
const TypeAdminPassword = dynamic(() => import('@/components/fullPageComps/TypeAdminPassword'), { ssr: false });
const PushNotificationInit = dynamic(() => import('@/components/utils/PushNotificationInit'), { ssr: false });

// Import AnimatedSplash with loading state - show static splash while loading
const AnimatedSplash = dynamic(
  () => import('@/components/utils/AnimatedSplash'),
  { 
    ssr: false,
    loading: () => (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
      }}>
        <span style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 'clamp(3rem, 12vw, 5rem)',
          fontWeight: 700,
          color: '#FF5973',
          letterSpacing: '-0.02em',
          opacity: 0,
        }}>
          SPYLL
        </span>
      </div>
    )
  }
);

const spylltheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(45, 45, 45)',
    },
  },
});

const spyllthemeDark = createTheme({
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

  // Apply mobile performance optimizations
  useMobileOptimizations();

  // Initialize mobile logger for debugging (saves logs to device)
  useEffect(() => {
    const initLogger = async () => {
      try {
        const { mobileLogger } = await import('@/utils/mobileLogger');
        await mobileLogger.init();
      } catch (e) {
        // Silently fail
      }
    };
    initLogger();
  }, []);

  // Initialize Firebase Analytics for native apps (tracks app vs web users in GA4)
  useEffect(() => {
    const initFirebaseAnalytics = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const { FirebaseAnalytics } = await import('@capacitor-firebase/analytics');
          // Enable analytics collection
          await FirebaseAnalytics.setEnabled({ enabled: true });
          // Log app_open event
          await FirebaseAnalytics.logEvent({ name: 'app_open', params: {} });
          console.log('Firebase Analytics initialized for native app');
        }
      } catch (e) {
        console.log('Firebase Analytics init skipped:', e.message);
        // Silently fail
      }
    };
    initLogger();
  }, []);

  // Animated splash state - start true to prevent flash, hide only on web
  const [showSplash, setShowSplash] = useState(true);
  const [splashChecked, setSplashChecked] = useState(false);

  // Check platform and hide splash on web immediately
  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) {
          // On web, hide splash immediately
          setShowSplash(false);
        }
      } catch (e) {
        // Not on native, hide splash
        setShowSplash(false);
      }
      setSplashChecked(true);
    };
    checkPlatform();
  }, []);

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

  // Handle hardware back button for Android/iOS (Capacitor)
  useEffect(() => {
    let backButtonListener = null;
    
    const setupBackButton = async () => {
      try {
        // Only import Capacitor in browser environment
        if (typeof window !== 'undefined') {
          const { App } = await import('@capacitor/app');
          const { Capacitor } = await import('@capacitor/core');
          
          // Only add listener on native platforms
          if (Capacitor.isNativePlatform()) {
            backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
              // Check if we can go back in browser history
              if (window.history.length > 1) {
                router.back();
              } else {
                // If at root, minimize app (don't exit)
                App.minimizeApp();
              }
            });
          }
        }
      } catch (error) {
        // Capacitor not available (running in browser)
        console.log('Running in browser mode, back button handled by browser');
      }
    };

    setupBackButton();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [router]);

  // If on admin page and still verifying:
  if (isAdminPage && adminLoading) {
    return (
      <ThemeProvider theme={spyllthemeDark}>
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
      <ThemeProvider theme={spyllthemeDark}>
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
          <ThemeProvider theme={spylltheme}>
            <CssBaseline />
            <GoogleAnalytics />
            <PushNotificationInit />
            {showSplash && <AnimatedSplash onComplete={() => setShowSplash(false)} />}
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
