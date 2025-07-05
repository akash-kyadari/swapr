const app = require('./src/app');
const { initializeSocket } = require('./src/sockets/socketServer');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.IO
initializeSocket(server); 