'use server'

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { OpenAIProvider } from '@/lib/ai/providers/openai';

/**
 * Message structure stored in JSONB
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Interface for a sent message
 */
export interface SendMessageInput {
  moduleId: string;
  content: string;
  role: 'user' | 'assistant';
}

/**
 * Retrieves all chat messages for a module
 */
export async function getMessages(moduleId: string): Promise<Message[]> {
  const moduleData = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { messages: true },
  });

  if (!moduleData) {
    throw new Error('Module not found');
  }

  // Parse and validate JSONB messages
  const messages = moduleData.messages as unknown as Message[];
  return Array.isArray(messages) ? messages : [];
}


/**
 * Adds a single message to the module's message array
 */
export async function addMessage(moduleId: string, message: Message): Promise<void> {
  const currentMessages = await getMessages(moduleId);

  // Check message limit
  const MAX_MESSAGES_PER_MODULE = 100;
  if (currentMessages.length >= MAX_MESSAGES_PER_MODULE) {
    throw new Error('Message limit reached for this module');
  }

  await prisma.module.update({
    where: { id: moduleId },
    data: {
      messages: [...currentMessages, message] as unknown as Prisma.InputJsonValue,
    },
  });
}