// src/lib/websocket/handlers.ts
import { Socket } from 'socket.io';
import { Message, getMessages, sendMessage } from '@/lib/actions/chatActions';

export type Handler = (socket: Socket, data: any) => Promise<void>;

export async function handleChatMessage(socket: Socket, data: any) {
  const { moduleId, message } = data;

  try {
    socket.join(moduleId);

    // Save user message and get AI response using chatService
    const result = await sendMessage({
      moduleId,
      content: message,
      role: 'user',
    });

    socket.emit('message_saved', { message: result.userMessage });

    // Emit AI response
    if (result.aiMessage) {
      socket.to(moduleId).emit('assistant_complete', {
        moduleId,
        message: result.aiMessage
      });
    }

  } catch (error) {
    socket.emit('error', {
      message: 'Failed to process message',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function handleTyping(socket: Socket, data: any) {
  const { moduleId, isTyping, userName } = data;

  socket.join(moduleId);
  socket.to(moduleId).emit('user_typing', {
    userId: socket.id,
    userName,
    isTyping,
    moduleId
  });
}

export async function handleJoinModule(socket: Socket, data: any) {
  const { moduleId } = data;
  socket.join(moduleId);
}