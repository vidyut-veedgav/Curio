// src/lib/websocket/WebSocketServer.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Handler } from './handlers';

export class WebSocketServer {
  private io: SocketIOServer;
  private handlers: Map<string, Handler>;

  constructor(
    httpServer: HTTPServer,
    handlers: Record<string, Handler>
  ) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.handlers = new Map(Object.entries(handlers));
    this.initialize();
  }

  private initialize() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      // Register all handlers
      this.handlers.forEach((handler, eventName) => {
        socket.on(eventName, async (data: any) => {
          try {
            await handler(socket, data);
          } catch (error) {
            console.error(`Error in handler ${eventName}:`, error);
            socket.emit('error', {
              event: eventName,
              message: 'Handler error'
            });
          }
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  getIO() {
    return this.io;
  }
}