import { useEffect } from 'react';
import Head from 'next/head';
import useUserStore from '../store/useUserStore';
import dynamic from 'next/dynamic';
import Loader from '../components/Loader';

const WhatsAppChat = dynamic(() => import('../components/WhatsAppChat'), {
  ssr: false,
  loading: () => <div className="flex justify-center mt-10"><Loader /></div>,
});

export default function Messages() {
  const { user, loading: userLoading } = useUserStore();

  // Show loading while user state is being determined
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-700">
        <div className="text-center">
          <Loader />
          <p className="text-secondary-600 dark:text-secondary-300 mt-4">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Control body scrolling
  useEffect(() => {
    document.body.classList.add('messages-page');
    return () => {
      document.body.classList.remove('messages-page');
    };
  }, []);

  return (
    <>
      <Head>
        <title>Messages - SkillSwap</title>
        <meta name="description" content="Chat with your skill exchange partners" />
      </Head>
      
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-700">
        {/* Header */}
        <div className="bg-white border-b border-secondary-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-secondary-900">Messages</h1>
          </div>
        </div>
        
        {/* Chat Component - Full Screen */}
        <div className="flex-1 overflow-hidden">
          <WhatsAppChat />
        </div>
      </div>
    </>
  );
} 