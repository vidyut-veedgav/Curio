import { createServer } from 'http';
import { Server } from 'socket.io';
import { handleAIChatGeneration } from './src/lib/websocket/handlers';

const port = parseInt(process.env.PORT || '3001', 10);

// Create simple HTTP server
const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'socket.io' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.io server running');
});

// Initialize Socket.IO
const io = new Server(httpServer, {
  path: '/api/socket',
  cors: {
    origin: '*', // Allow all origins
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
  .listen(port, '0.0.0.0', () => {
    console.log(`> Socket.IO server ready on port ${port}`);
    console.log(`> Socket.IO path: /api/socket`);
  });
