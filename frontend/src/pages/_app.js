import '../styles/globals.css';
import Layout from '../components/Layout';
import useUserStore from '../store/useUserStore';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const protectedRoutes = ['/dashboard', '/profile/edit'];

export default function App({ Component, pageProps }) {
  const { user, loading, fetchUser } = useUserStore();
  const router = useRouter();

  // Only fetch user on initial mount, not on every route change
  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Debug logging
    console.log('Auth Debug:', { user, loading, path: router.pathname });
    if (!loading && !user && protectedRoutes.includes(router.pathname)) {
      console.log('Redirecting to /auth/login because user is not authenticated');
      router.replace('/auth/login');
    }
  }, [user, loading, router.pathname]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
