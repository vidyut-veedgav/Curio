import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { handleAIChatGeneration } from './src/lib/websocket/handlers';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({
  dev,
  hostname,
  port,
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`,
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
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO initialized on path /api/socket`);
    });
});