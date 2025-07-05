import { useState, useEffect } from 'react';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getSocket } from '../utils/socket';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const checkConnection = () => {
      setIsConnected(socket.connected);
    };

    // Check initial connection
    checkConnection();

    // Listen for connection events
    const handleConnect = () => {
      setIsConnected(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setShowStatus(true);
    };

    const handleConnectError = () => {
      setIsConnected(false);
      setShowStatus(true);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Set up interval to check connection
    const interval = setInterval(checkConnection, 5000);

    return () => {
      clearInterval(interval);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  if (!showStatus && isConnected) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${showStatus ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isConnected ? (
          <WifiIcon className="w-4 h-4" />
        ) : (
          <ExclamationTriangleIcon className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
} 