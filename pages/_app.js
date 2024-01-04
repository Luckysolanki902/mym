import { useRouter } from 'next/router';
import '@/styles/globals.css';
import SessionProvider from './SessionProvider';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Check if the current route is '/signup' or '/signin'
  const isAuthRoute = router.pathname === '/signup' || router.pathname === '/signin';

  return (
    <SessionProvider>
      {!isAuthRoute && <Topbar />}
      {!isAuthRoute && <Sidebar />}

      {!isAuthRoute && (
        <div style={{ position: 'fixed', height: '90vh', bottom: '0', right: '0' }} className='leftwidth'>
          <Component {...pageProps} />
        </div>
      )}
      {isAuthRoute && <Component {...pageProps} />}
    </SessionProvider>
  );
}
