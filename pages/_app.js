import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import LoadingBar from 'react-top-loading-bar';
import TypeAdminPassword from '@/components/fullPageComps/TypeAdminPassword';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import SessionProvider from './SessionProvider';
import Topbar from '@/components/appComps/Topbar';
import Sidebar from '@/components/appComps/Sidebar';
import '@/styles/globals.css';
import PageRefresh from '@/components/loadings/PageRefresh';
import Image from 'next/image';
import CustomHead from '@/components/seo/CustomHead';
// import { Analytics } from "@vercel/analytics/react"

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
  // const [progress, setProgress] = useState(0);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const isAdminPage = router.pathname.startsWith('/admin');
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingGif, setShowLoadingGif] = useState(false)
  // const isAuthRoute = router.pathname.startsWith('/auth') || router.pathname.startsWith('/verify');



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

    if (isAdminPage) {
      verifyToken();
    }
  }, []);


  useEffect(() => {
    let timeout;

    router.events.on('routeChangeStart', () => {
      setShowLoadingGif(true);
      // Set a timeout to hide the loading indicator after 5 seconds
      timeout = setTimeout(() => {
        setShowLoadingGif(false);
      }, 10000); // Adjust this timeout duration as needed
    });

    router.events.on('routeChangeComplete', () => {
      // Clear the timeout and hide the loading indicator
      clearTimeout(timeout);
      setShowLoadingGif(false);
    });

    return () => {
      clearTimeout(timeout); // Clear the timeout on component unmount
    };
  }, [router.events]);




  return (
    <>
      <CustomHead />
      {/* <LoadingBar
        height={2}
        color='rgb(45, 45, 45)'
        progress={progress}
        waitingTime={600}
        onLoaderFinished={() => setProgress(0)}
      /> */}
      {/* <Analytics/> */}
      {isAdminPage ? (
        <ThemeProvider theme={mymthemeDark}>
          <CssBaseline />
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
            <CssBaseline />
            {/* {!isAuthRoute && <Topbar />} */}
            <Topbar />
            <Sidebar />
            <div style={{ display: 'flex', flex: 1, overflowY: 'scroll', position: 'relative' }} className='remcheight'>
              <div style={{ overflow: 'auto', flex: 1 }} className='remcwidth'>
                {showLoadingGif &&
                  <div style={{ width: 'var(--remwidth)', height: '100%', display: 'flex', position: 'absolute', top: '0', right: '0', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', zIndex: '999' }}>
                    <Image src={'/gifs/rhombus.gif'} priority width={800 / 3} height={800 / 3} className='loadingGif' alt='loading'></Image>
                  </div>
                }
                <Component {...pageProps} />
              </div>
            </div>
          </ThemeProvider>
        </SessionProvider>
      )}
    </>
  );
}


