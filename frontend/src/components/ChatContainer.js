import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import ReviewModal from './ReviewModal';
import { socket } from '../utils/socket';
import useUserStore from '../store/useUserStore';

export default function ChatContainer({ 
  messages, 
  onSendMessage, 
  currentUserId, 
  disabled = false,
  className = '',
  swapId,
  otherUserName,
  swap = null,
  otherUser = null
}) {
  const { user } = useUserStore();
  const [localMessages, setLocalMessages] = useState(messages || []);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Update local messages when prop changes
  useEffect(() => {
    setLocalMessages(messages || []);
  }, [messages]);

  // Check if swap is completed and show review modal
  useEffect(() => {
    if (swap && swap.status === 'completed' && !hasReviewed && !showReviewModal) {
      // Show review modal after a short delay
      const timer = setTimeout(() => {
        setShowReviewModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [swap, hasReviewed, showReviewModal]);

  // Check if user is near bottom of chat
  const checkScrollPosition = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    const isNear = scrollHeight - scrollTop - clientHeight < threshold;
    setIsNearBottom(isNear);
  };

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (isNearBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, isNearBottom]);

  // Socket event listeners
  useEffect(() => {
    if (!swapId || !socket || !user?._id) return;

    // Join the swap room
    socket.emit('join_swap_room', { swapId, userId: user._id });

    // Listen for new messages
    const handleNewMessage = (message) => {
      if (message.swapId === swapId || message.swap === swapId) {
        setLocalMessages(prev => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    // Listen for typing indicators
    const handleTypingStart = (data) => {
      if (data.swapId === swapId && data.userId !== user._id) {
        setTypingUsers(prev => new Set([...prev, data.userName || 'Someone']));
      }
    };

    const handleTypingStop = (data) => {
      if (data.swapId === swapId && data.userId !== user._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userName || 'Someone');
          return newSet;
        });
      }
    };

    // Listen for user joined/left
    const handleUserJoined = (data) => {
      if (data.swapId === swapId) {
        console.log(`${data.userName} joined the chat`);
      }
    };

    const handleUserLeft = (data) => {
      if (data.swapId === swapId) {
        console.log(`${data.userName} left the chat`);
      }
    };

    // Add event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);

    // Cleanup function
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      
      // Leave the room when component unmounts
      if (socket && user?._id) {
        socket.emit('leave_swap_room', { swapId, userId: user._id });
      }
    };
  }, [swapId, user._id, user.name]);

  const handleSendMessage = async (content) => {
    if (!content.trim() || disabled) return;

    try {
      // Optimistically add message to UI
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        content,
        sender: { _id: user._id, name: user.name, avatar: user.avatar },
        swapId,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      setLocalMessages(prev => [...prev, tempMessage]);

      // Send message via API
      const newMessage = await onSendMessage(content);
      
      // Replace optimistic message with real one
      if (newMessage) {
        setLocalMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id ? newMessage : msg
          )
        );
      }

      // Stop typing indicator
      if (socket) {
        socket.emit('typing_stop', { 
          swapId, 
          userId: user._id, 
          userName: user.name 
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setLocalMessages(prev => 
        prev.filter(msg => msg._id !== `temp_${Date.now()}`)
      );
    }
  };

  const handleTyping = (isTyping) => {
    if (!socket) return;
    
    if (isTyping) {
      socket.emit('typing_start', { 
        swapId, 
        userId: user._id, 
        userName: user.name 
      });
    } else {
      socket.emit('typing_stop', { 
        swapId, 
        userId: user._id, 
        userName: user.name 
      });
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReviewSubmitted = () => {
    setHasReviewed(true);
    setShowReviewModal(false);
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 py-1 space-y-0"
        onScroll={checkScrollPosition}
        style={{ 
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 #F7FAFC'
        }}
      >
        {/* Scroll to bottom button */}
        {!isNearBottom && localMessages.length > 5 && (
          <div className="sticky top-1 z-10 flex justify-center mb-1">
            <button
              onClick={scrollToBottom}
              className="bg-gray-800 text-white p-1.5 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        )}

        {localMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[250px]">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No messages yet</h3>
              <p className="text-sm text-gray-600">Start the conversation by sending a message!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Welcome message for first time */}
            {localMessages.length === 1 && (
              <div className="text-center py-2">
                <div className="inline-block bg-gray-100 rounded-full px-3 py-1">
                  <p className="text-sm text-gray-600">
                    Messages are end-to-end encrypted
                  </p>
                </div>
              </div>
            )}
            
            {/* Messages */}
            {localMessages.map((message, index) => (
              <ChatMessage
                key={message._id}
                message={message}
                isOwn={message.sender._id === currentUserId}
                isOptimistic={message.isOptimistic}
                showDate={index === 0 || 
                  new Date(message.createdAt).toDateString() !== 
                  new Date(localMessages[index - 1]?.createdAt).toDateString()}
              />
            ))}
          </>
        )}
        
        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <TypingIndicator users={Array.from(typingUsers)} />
        )}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} className="h-0.5" />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-2 py-2">
        <ChatInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={disabled}
          placeholder={disabled ? "This swap is completed" : "Type a message..."}
        />
      </div>

      {/* Review Modal */}
      {showReviewModal && swap && otherUser && (
        <ReviewModal
          swap={swap}
          otherUser={otherUser}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
} 