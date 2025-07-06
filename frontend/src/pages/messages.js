import { useEffect } from 'react';
import Head from 'next/head';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import useUserStore from '../store/useUserStore';
import WhatsAppChat from '../components/WhatsAppChat';

export default function Messages() {
  const { user, loading: userLoading } = useUserStore();

  // Show loading while user state is being determined
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-secondary-600">Loading messages...</p>
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
      
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-secondary-50 via-white to-primary-50">
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