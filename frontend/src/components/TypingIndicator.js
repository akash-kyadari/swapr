import { useState, useEffect } from 'react';

export default function TypingIndicator({ users = [] }) {
  const [dots, setDots] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (users.length === 0) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [users.length]);

  if (!isVisible || users.length === 0) return null;

  const userNames = users.length === 1 
    ? users[0] 
    : users.length === 2 
      ? `${users[0]} and ${users[1]}` 
      : `${users[0]} and ${users.length - 1} others`;

  return (
    <div className="flex justify-start mb-2">
      <div className="flex items-center gap-2 max-w-[70%]">
        {/* Avatar placeholder */}
        <div className="flex-shrink-0 mr-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse"></div>
        </div>
        
        {/* Typing bubble */}
        <div className="flex flex-col">
          <div className="relative rounded-2xl px-4 py-2.5 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            
            {/* Message tail */}
            <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
          </div>
          
          <div className="text-sm text-gray-500 mt-1 px-1">
            {userNames} typing{dots}
          </div>
        </div>
      </div>
    </div>
  );
} 