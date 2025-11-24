import { Server as SocketIOServer } from 'socket.io';
import { NextRequest } from 'next/server';
import { Server as HTTPServer } from 'http';
import { handleAIChatGeneration } from '@/lib/websocket/handlers';

// Store the Socket.IO server instance
let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  // Check if Socket.IO server is already initialized
  if (!io) {
    // Access the HTTP server from the Next.js request
    const res = new Response(null, {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
      },
    });

    // Initialize Socket.IO server
    const httpServer = (req as any).socket?.server as HTTPServer;

    if (!httpServer) {
      return new Response('WebSocket upgrade failed', { status: 500 });
    }

    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    // Handle socket connections
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Register AI chat generation handler
      socket.on('ai:chat:generate', async (data) => {
        await handleAIChatGeneration(socket, data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return new Response('Socket.IO server running', { status: 200 });
}