import { useRouter } from 'next/router';
import '@/styles/globals.css';
import SessionProvider from './SessionProvider';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { createTheme, ThemeProvider } from '@mui/material';



const mymtheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(45, 45, 45)',
    },
  },
});



export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Check if the current route starts from /auth
  const isAuthRoute = router.pathname.startsWith('/auth') || router.pathname.startsWith('/verify');

  return (
    <SessionProvider>
      <ThemeProvider theme={mymtheme}>

        {!isAuthRoute && <Topbar />}
        {!isAuthRoute && <Sidebar />}

        {!isAuthRoute && (
          <div style={{ position: 'fixed', bottom: '0', right: '0', overflowY: 'auto' }} className='remcomponents'>
            <Component {...pageProps} />
          </div>
        )}
        {isAuthRoute && <Component {...pageProps} />}
      </ThemeProvider>

    </SessionProvider>
  );
}
