import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = () => {
  if (socket) {
    return socket;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  socket = io(baseUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Export the socket instance for direct use
export { socket }; 