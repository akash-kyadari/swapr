import { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ChatContainer from './ChatContainer';
import useUserStore from '../store/useUserStore';
import { apiFetch } from '../utils/api';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export default function MobileChatView({ swap, onBack }) {
  const { user } = useUserStore();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const otherUser = swap.sender._id === user._id ? swap.receiver : swap.sender;

  useEffect(() => {
    fetchMessages();
  }, [swap._id]);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const messagesData = await apiFetch(`/api/messages/${swap._id}`);
      setMessages(messagesData);
    } catch (err) {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;
    
    try {
      const newMessage = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ swapId: swap._id, content }),
      });
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Mobile Header */}
      <div className="flex-shrink-0 flex items-center gap-3 p-3 border-b border-gray-200 bg-white">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex-shrink-0 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img
            src={otherUser?.avatar || '/avatar.png'}
            alt={otherUser?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 text-sm truncate">
              {otherUser?.name || 'Anonymous User'}
            </h2>
            <div className="text-xs text-gray-600 truncate">
              {swap.sender._id === user._id ? 'You offered' : 'They offered'}:{' '}
              <span className="font-medium text-blue-600">
                {Array.isArray(swap.offeredSkill) ? swap.offeredSkill.join(', ') : swap.offeredSkill}
              </span>
            </div>
          </div>
        </div>
        
        {/* Status badges */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
            swap.difficultyLevel === 'Beginner' ? 'bg-green-100 text-green-700' :
            swap.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
            swap.difficultyLevel === 'Advanced' ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
            {swap.difficultyLevel || 'Intermediate'}
          </span>
          {swap.isUrgent && (
            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <ExclamationTriangleIcon className="w-2.5 h-2.5" />
              Urgent
            </span>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-base text-gray-600">Loading messages...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-3 text-base">{error}</p>
              <button
                onClick={fetchMessages}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-base"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <ChatContainer
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserId={user._id}
            disabled={swap.status === 'completed'}
            className="h-full"
            swapId={swap._id}
            otherUserName={otherUser?.name || 'Partner'}
            swap={swap}
            otherUser={otherUser}
          />
        )}
      </div>
    </div>
  );
} 