import { useState } from 'react';
import { formatDistanceToNow } from '../utils/dateUtils';

export default function ChatMessage({ message, isOwn, isOptimistic = false, showDate = false }) {
  const [showTime, setShowTime] = useState(false);
  
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="w-full">
      {/* Date separator */}
      {showDate && (
        <div className="flex justify-center my-1">
          <div className="bg-gray-100 rounded-full px-2 py-0.5">
            <span className="text-sm text-gray-600 font-medium">
              {formatDate(message.createdAt)}
            </span>
          </div>
        </div>
      )}

      {/* Message */}
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-0.5`}>
        <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
          {/* Avatar (only for other user's messages) */}
          {!isOwn && (
            <div className="flex items-end gap-1 mb-0.5">
              <img
                src={message.sender?.avatar || '/avatar.png'}
                alt={message.sender?.name || 'User'}
                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
              />
            </div>
          )}

          {/* Message bubble */}
          <div className={`relative group ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
            <div
              className={`px-3 py-2 rounded-2xl text-base leading-relaxed break-words ${
                isOwn
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
              } ${isOptimistic ? 'opacity-70' : ''}`}
              onMouseEnter={() => setShowTime(true)}
              onMouseLeave={() => setShowTime(false)}
            >
              {message.content}
              
              {/* Optimistic indicator */}
              {isOptimistic && (
                <div className="inline-block ml-1">
                  <div className="animate-pulse">
                    <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Time tooltip */}
            {showTime && (
              <div className={`absolute bottom-full mb-1 px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-lg z-10 ${
                isOwn ? 'right-0' : 'left-0'
              }`}>
                {formatTime(message.createdAt)}
                <div className={`absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                  isOwn ? 'right-2 border-t-gray-800' : 'left-2 border-t-gray-800'
                }`}></div>
              </div>
            )}

            {/* Message status (for own messages) */}
            {isOwn && !isOptimistic && (
              <div className="flex items-center justify-end gap-0.5 mt-0.5">
                <span className="text-sm text-gray-400">
                  {formatTime(message.createdAt)}
                </span>
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 