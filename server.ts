import { createServer } from 'http';
import { Server } from 'socket.io';
import { handleAIChatGeneration } from './src/lib/websocket/handlers';

const port = parseInt(process.env.WEBSOCKET_PORT || '3001', 10);

const httpServer = createServer();

// Initialize Socket.IO
const io = new Server(httpServer, {
  path: '/api/socket',
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Register AI chat generation handler
  socket.on('ai:chat:generate', async (data) => {
    try {
      await handleAIChatGeneration(socket, data);
    } catch (error) {
      console.error('Error in AI chat generation:', error);
      socket.emit('ai:chat:error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer
  .once('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`> WebSocket server ready on http://localhost:${port}`);
    console.log(`> Socket.IO path: /api/socket`);
  });