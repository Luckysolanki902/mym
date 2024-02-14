import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import LoadingBar from 'react-top-loading-bar';
import TypeAdminPassword from '@/components/fullPageComps/TypeAdminPassword';
import { createTheme, ThemeProvider } from '@mui/material';
import SessionProvider from './SessionProvider';
import Topbar from '@/components/appComps/Topbar';
import Sidebar from '@/components/appComps/Sidebar';
import '@/styles/globals.css';

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
  const [progress, setProgress] = useState(0);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const isAdminPage = router.pathname.startsWith('/admin');
  const [isLoading, setIsLoading] = useState(true);
  const isAuthRoute = router.pathname.startsWith('/auth') || router.pathname.startsWith('/verify');


  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('adminAuthToken');

        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/admin/security/authenticate', {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });

        const data = await response.json();

        if (data.success) {
          setIsAdminLoggedIn(true);
        } else {
          // Handle invalid or expired token
          console.error('Invalid token or insufficient privileges.');
          localStorage.removeItem('adminAuthToken');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        // Handle token verification error
        localStorage.removeItem('adminAuthToken');
      } finally {
        setIsLoading(false); // Hide loading indicator when verification is complete
      }
    };

    verifyToken();
  }, []);


  useEffect(() => {
    let interval;
    const startProgress = () => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        return newProgress >= 100 ? 100 : newProgress;
      });
    };

    router.events.on('routeChangeStart', () => {
      setProgress(0);
      interval = setInterval(startProgress, 50);
    });

    router.events.on('routeChangeComplete', () => {
      clearInterval(interval);
      setProgress(100);
    });

    return () => {
      clearInterval(interval);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <title>MYM</title>
        <meta name="description" content={`Meet Your Mate`} />
      </Head>
      {/* <LoadingBar
        height={2}
        color='rgb(45, 45, 45)'
        progress={progress}
        waitingTime={600}
        onLoaderFinished={() => setProgress(0)}
      /> */}
      {isAdminPage ? (
        <ThemeProvider theme={mymthemeDark}>
          {isLoading && (
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999 }}>
              Loading...
            </div>
          )}
          {!isLoading && (
            isAdminLoggedIn ? (
              <Component {...pageProps} />
            ) : (
              <TypeAdminPassword onLogin={() => setIsAdminLoggedIn(true)} />
            )
          )}
        </ThemeProvider>
      ) : (
        <SessionProvider>

          <ThemeProvider theme={mymtheme}>
            <div style={{ display: 'flex', width: '100vw', height: '100vh', flexDirection: 'column', overflow: 'hidden' }}>

              {!isAuthRoute && <Topbar />}

              <div style={{ display: 'flex', width: '100vw', overflow: 'hidden' }}>
                {!isAuthRoute && <Sidebar />}
                <div style={{ overflow: 'auto', width: '100%' }}>
                  <Component {...pageProps} />
                </div>
              </div>

            </div>
          </ThemeProvider>

        </SessionProvider>
      )}
    </>
  );
}
