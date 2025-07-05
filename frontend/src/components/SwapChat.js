import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from './Card';
import ChatContainer from './ChatContainer';
import Button from './Button';
import useUserStore from '../store/useUserStore';
import { apiFetch } from '../utils/api';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  UserIcon 
} from '@heroicons/react/24/solid';

export default function SwapChat({ swapId, onBack }) {
  const router = useRouter();
  const { user } = useUserStore();
  const [swap, setSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!swapId) return;
    fetchSwapAndMessages();
  }, [swapId]);

  const fetchSwapAndMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const [swapData, messagesData] = await Promise.all([
        apiFetch(`/api/swaps/${swapId}`),
        apiFetch(`/api/messages/${swapId}`)
      ]);
      setSwap(swapData);
      setMessages(messagesData);
    } catch (err) {
      setError('Failed to load swap and messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;
    
    setSending(true);
    try {
      const newMessage = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ swapId, content }),
      });
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await apiFetch(`/api/swaps/${swapId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' }),
      });
      const updatedSwap = await apiFetch(`/api/swaps/${swapId}`);
      setSwap(updatedSwap);
    } catch (err) {
      setError('Failed to mark as complete.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchSwapAndMessages} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  if (!swap) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Swap not found.</p>
      </div>
    );
  }

  // Only show chat for accepted swaps
  if (swap.status !== 'accepted') {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Chat is only available for accepted swaps.</p>
      </div>
    );
  }

  const otherUser = swap.sender._id === user._id ? swap.receiver : swap.sender;
  const isCompleted = swap.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Swap Summary Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <img
              src={otherUser?.avatar || '/avatar.png'}
              alt={otherUser?.name || 'User'}
              className="w-12 h-12 rounded-full object-cover border border-slate-200"
            />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {otherUser?.name || 'Anonymous User'}
              </h2>
              <div className="text-sm text-slate-600 mt-1">
                {swap.sender._id === user._id ? 'You offered' : 'They offered'}:{' '}
                <span className="font-medium text-blue-600">
                  {Array.isArray(swap.offeredSkill) ? swap.offeredSkill.join(', ') : swap.offeredSkill}
                </span>
              </div>
              <div className="text-sm text-slate-600">
                Needs: <span className="font-medium text-green-600">{swap.requestedSkill}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              swap.difficultyLevel === 'Beginner' ? 'bg-green-100 text-green-700' :
              swap.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
              swap.difficultyLevel === 'Advanced' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {swap.difficultyLevel || 'Intermediate'}
            </span>
            {swap.isUrgent && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                <ExclamationTriangleIcon className="w-3 h-3" />
                Urgent
              </span>
            )}
            {isCompleted && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircleIcon className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>
        </div>
        
        {swap.message && (
          <div className="bg-slate-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-slate-700">{swap.message}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Messages
          </Button>
          
          {!isCompleted && (
            <Button
              onClick={handleMarkComplete}
              variant="success"
              className="flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Mark Complete
            </Button>
          )}
        </div>
      </Card>

      {/* Chat Container */}
      <div className="h-96 lg:h-[500px]">
        <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUserId={user._id}
          disabled={isCompleted || sending}
          className="h-full"
          swapId={swapId}
          otherUserName={otherUser?.name || 'Partner'}
        />
      </div>
    </div>
  );
} 