import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ChatContainer from './ChatContainer';
import MobileChatView from './MobileChatView';
import ConnectionStatus from './ConnectionStatus';
import useUserStore from '../store/useUserStore';
import { apiFetch } from '../utils/api';
import { 
  ChatBubbleLeftRightIcon, 
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from '../utils/dateUtils';
import { initializeSocket } from '../utils/socket';

export default function WhatsAppChat() {
  const router = useRouter();
  const { user } = useUserStore();
  const [swaps, setSwaps] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSwaps();
    
    // Initialize socket connection
    if (user) {
      initializeSocket();
    }
  }, [user]);

  const fetchSwaps = async () => {
    setLoading(true);
    setError('');
    try {
      const swapsData = await apiFetch('/api/messages/user-swaps');
      setSwaps(swapsData);
    } catch (err) {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapSelect = async (swap) => {
    setSelectedSwap(swap);
    try {
      const messagesData = await apiFetch(`/api/messages/${swap._id}`);
      setMessages(messagesData);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (content) => {
    if (!content.trim() || !selectedSwap) return;
    
    try {
      const newMessage = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ swapId: selectedSwap._id, content }),
      });
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  const filteredSwaps = swaps.filter(swap => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const otherUser = swap.sender._id === user._id ? swap.receiver : swap.sender;
    
    // Search by user name
    const userName = otherUser?.name || '';
    if (userName.toLowerCase().includes(searchLower)) return true;
    
    // Search by offered skill
    const offeredSkill = Array.isArray(swap.offeredSkill) 
      ? swap.offeredSkill.join(' ') 
      : swap.offeredSkill || '';
    if (offeredSkill.toLowerCase().includes(searchLower)) return true;
    
    // Search by requested skill
    const requestedSkill = Array.isArray(swap.requestedSkill) 
      ? swap.requestedSkill.join(' ') 
      : swap.requestedSkill || '';
    if (requestedSkill.toLowerCase().includes(searchLower)) return true;
    
    // Search by latest message content
    if (swap.latestMessage?.content?.toLowerCase().includes(searchLower)) return true;
    
    return false;
  });

  const otherUser = selectedSwap ? (selectedSwap.sender._id === user._id ? selectedSwap.receiver : selectedSwap.sender) : null;

  return (
    <div className="h-full w-full bg-gray-100 flex overflow-hidden">
      <ConnectionStatus />
      
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full">
        {/* Left Sidebar - Conversations */}
        <div className="w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
              <button
                onClick={() => router.push('/marketplace')}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-base text-gray-600">Loading conversations...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-3 text-center">
                <p className="text-red-500 mb-3 text-base">{error}</p>
                <button
                  onClick={fetchSwaps}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-base"
                >
                  Try Again
                </button>
              </div>
            ) : filteredSwaps.length === 0 ? (
              <div className="p-4 text-center">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No conversations</h3>
                <p className="text-gray-600 mb-3 text-sm">
                  {searchTerm ? 'No conversations match your search.' : 'Start chatting with your swap partners.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => router.push('/marketplace')}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-base"
                  >
                    Browse Marketplace
                  </button>
                )}
              </div>
            ) : (
              filteredSwaps.map((swap) => {
                const otherUser = swap.sender._id === user._id ? swap.receiver : swap.sender;
                const isSelected = selectedSwap?._id === swap._id;
                const isCompleted = swap.status === 'completed';
                
                return (
                  <div
                    key={swap._id}
                    onClick={() => handleSwapSelect(swap)}
                    className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative flex-shrink-0">
                        <img
                          src={otherUser?.avatar || '/avatar.png'}
                          alt={otherUser?.name || 'User'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {isCompleted && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5">
                            <CheckCircleIcon className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-semibold text-gray-900 truncate text-sm">
                            {otherUser?.name || 'Anonymous User'}
                          </h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {swap.isUrgent && (
                              <ExclamationTriangleIcon className="w-2.5 h-2.5 text-red-500" />
                            )}
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(swap.updatedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-0.5">
                          {swap.sender._id === user._id ? 'You offered' : 'They offered'}:{' '}
                          <span className="font-medium text-blue-600">
                            {Array.isArray(swap.offeredSkill) ? swap.offeredSkill.join(', ') : swap.offeredSkill}
                          </span>
                        </div>
                        
                        {swap.latestMessage ? (
                          <p className="text-xs text-gray-500 truncate">
                            {swap.latestMessage.content}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">
                            No messages yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {selectedSwap ? (
            <>
              {/* Chat Header */}
              <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <img
                    src={otherUser?.avatar || '/avatar.png'}
                    alt={otherUser?.name || 'User'}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 text-sm truncate">
                      {otherUser?.name || 'Anonymous User'}
                    </h2>
                    <div className="text-xs text-gray-600 truncate">
                      {selectedSwap.sender._id === user._id ? 'You offered' : 'They offered'}:{' '}
                      <span className="font-medium text-blue-600">
                        {Array.isArray(selectedSwap.offeredSkill) ? selectedSwap.offeredSkill.join(', ') : selectedSwap.offeredSkill}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      selectedSwap.difficultyLevel === 'Beginner' ? 'bg-green-100 text-green-700' :
                      selectedSwap.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      selectedSwap.difficultyLevel === 'Advanced' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedSwap.difficultyLevel || 'Intermediate'}
                    </span>
                    {selectedSwap.isUrgent && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-2.5 h-2.5" />
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 min-h-0">
                <ChatContainer
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentUserId={user._id}
                  disabled={selectedSwap.status === 'completed'}
                  className="h-full"
                  swapId={selectedSwap._id}
                  otherUserName={otherUser?.name || 'Partner'}
                  swap={selectedSwap}
                  otherUser={otherUser}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Select a conversation</h3>
                <p className="text-gray-600 text-xs">
                  Choose a conversation from the sidebar to start chatting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden w-full h-full">
        {selectedSwap ? (
          <MobileChatView 
            swap={selectedSwap} 
            onBack={() => setSelectedSwap(null)} 
          />
        ) : (
          <div className="w-full h-full bg-white flex flex-col overflow-hidden">
            {/* Mobile Header */}
            <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
                <button
                  onClick={() => router.push('/marketplace')}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Mobile Conversations List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-base text-gray-600">Loading conversations...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-3 text-center">
                  <p className="text-red-500 mb-3 text-base">{error}</p>
                  <button
                    onClick={fetchSwaps}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-base"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredSwaps.length === 0 ? (
                <div className="p-4 text-center">
                  <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <h3 className="text-base font-semibold text-gray-900 mb-1">No conversations</h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    {searchTerm ? 'No conversations match your search.' : 'Start chatting with your swap partners.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => router.push('/marketplace')}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-base"
                    >
                      Browse Marketplace
                    </button>
                  )}
                </div>
              ) : (
                filteredSwaps.map((swap) => {
                  const otherUser = swap.sender._id === user._id ? swap.receiver : swap.sender;
                  const isSelected = selectedSwap?._id === swap._id;
                  const isCompleted = swap.status === 'completed';
                  
                  return (
                    <div
                      key={swap._id}
                      onClick={() => handleSwapSelect(swap)}
                      className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative flex-shrink-0">
                          <img
                            src={otherUser?.avatar || '/avatar.png'}
                            alt={otherUser?.name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {isCompleted && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5">
                              <CheckCircleIcon className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="font-semibold text-gray-900 truncate text-sm">
                              {otherUser?.name || 'Anonymous User'}
                            </h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {swap.isUrgent && (
                                <ExclamationTriangleIcon className="w-2.5 h-2.5 text-red-500" />
                              )}
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(swap.updatedAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-0.5">
                            {swap.sender._id === user._id ? 'You offered' : 'They offered'}:{' '}
                            <span className="font-medium text-blue-600">
                              {Array.isArray(swap.offeredSkill) ? swap.offeredSkill.join(', ') : swap.offeredSkill}
                            </span>
                          </div>
                          
                          {swap.latestMessage ? (
                            <p className="text-xs text-gray-500 truncate">
                              {swap.latestMessage.content}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 italic">
                              No messages yet
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 