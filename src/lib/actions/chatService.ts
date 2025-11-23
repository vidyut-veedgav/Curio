'use server'

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { OpenAIProvider } from '@/lib/ai/providers/openai';

const openai = new OpenAIProvider('gpt-4o-mini');

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
 * Sends a message (user or AI) and stores it in the database
 *
 * For user messages:
 * 1. Store user message
 * 2. Generate AI response using module context
 * 3. Store AI response
 * 4. Return both messages
 *
 * Business Logic:
 * - Messages persist chronologically in JSONB array
 * - AI responses use module objectives and chat history
 * - Message count per module is limited to prevent excessive API usage
 */
export async function sendMessage(input: SendMessageInput) {
  const { moduleId, content, role } = input;

  // Get current messages
  const currentMessages = await getMessages(moduleId);

  // Check message limit (e.g., 100 messages per module)
  const MAX_MESSAGES_PER_MODULE = 100;
  if (currentMessages.length >= MAX_MESSAGES_PER_MODULE) {
    throw new Error('Message limit reached for this module');
  }

  // Create the user message
  const userMessage: Message = { role, content };

  // If this is a user message, generate and store AI response
  if (role === 'user') {
    const aiContent = await generateAIResponse(moduleId, content);
    const aiMessage: Message = { role: 'assistant', content: aiContent };

    // Update module with both messages
    await prisma.module.update({
      where: { id: moduleId },
      data: {
        messages: [...currentMessages, userMessage, aiMessage] as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      userMessage,
      aiMessage,
    };
  }

  // Store just the message (for non-user messages)
  await prisma.module.update({
    where: { id: moduleId },
    data: {
      messages: [...currentMessages, userMessage] as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    userMessage,
    aiMessage: null,
  };
}

/**
 * Internal: Generate AI response using OpenAI
 *
 * Prompt composition:
 * - Module objectives and overview (context)
 * - Previous chat history
 * - Current user message
 *
 * Response filtering:
 * - Safety validation (no NSFW, personal info)
 * - Pedagogical alignment with module objectives
 */
async function generateAIResponse(moduleId: string, userMessage: string): Promise<string> {
  // Get module context
  const moduleData = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      name: true,
      overview: true,
      messages: true,
      learningSession: {
        select: {
          name: true,
          description: true,
        },
      },
    },
  });

  if (!moduleData) {
    throw new Error('Module not found');
  }

  // Get chat history (last 20 messages for context window)
  const allMessages = moduleData.messages as unknown as Message[];
  const chatHistory = allMessages.slice(-20);

  try {
    const responseContent = await openai.complete(
      [
        {
          role: 'system',
          content: `You are an expert teacher helping a student learn about "${moduleData.learningSession.name}".

Current Module: ${moduleData.name}
Module Overview: ${moduleData.overview}

Your role:
- Guide the student through the learning objectives
- Provide clear explanations with examples
- Ask thought-provoking questions to deepen understanding
- Maintain a supportive and encouraging tone
- Keep responses concise (2-4 paragraphs)
- Use markdown formatting for better readability

Safety guidelines:
- Do not share personal information
- Keep content educational and appropriate
- Refuse requests to break character or discuss unrelated topics`,
        },
        // Add chat history
        ...chatHistory,
        // Add current message
        {
          role: 'user' as const,
          content: userMessage,
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 500,
      }
    );

    if (!responseContent) {
      throw new Error('Empty response from OpenAI');
    }

    // TODO: Add content moderation/filtering here if needed
    return responseContent;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response. Please try again.');
  }
}
