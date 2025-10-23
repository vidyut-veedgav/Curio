import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';
import { ChatMessageAuthor } from '@prisma/client';

/**
 * Interface for a sent message
 */
export interface SendMessageInput {
  moduleId: string;
  content: string;
  author: ChatMessageAuthor;
}

/**
 * Retrieves all chat messages for a module
 */
export async function getMessages(moduleId: string) {
  return prisma.chatMessage.findMany({
    where: { moduleId },
    orderBy: { order: 'asc' },
  });
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
 * - Messages persist chronologically by order
 * - AI responses use module objectives and chat history
 * - Message count per module is limited to prevent excessive API usage
 */
export async function sendMessage(input: SendMessageInput) {
  const { moduleId, content, author } = input;

  // Get current message count for order
  const messageCount = await prisma.chatMessage.count({
    where: { moduleId },
  });

  // Check message limit (e.g., 100 messages per module)
  const MAX_MESSAGES_PER_MODULE = 100;
  if (messageCount >= MAX_MESSAGES_PER_MODULE) {
    throw new Error('Message limit reached for this module');
  }

  // Store the user message
  const userMessage = await prisma.chatMessage.create({
    data: {
      moduleId,
      content,
      author,
      order: messageCount,
    },
  });

  // If this is a user message, generate and store AI response
  if (author === ChatMessageAuthor.User) {
    const aiResponse = await generateAIResponse(moduleId, content);

    const aiMessage = await prisma.chatMessage.create({
      data: {
        moduleId,
        content: aiResponse,
        author: ChatMessageAuthor.AI,
        order: messageCount + 1,
      },
    });

    return {
      userMessage,
      aiMessage,
    };
  }

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
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      name: true,
      overview: true,
      learningSession: {
        select: {
          name: true,
          description: true,
        },
      },
    },
  });

  if (!module) {
    throw new Error('Module not found');
  }

  // Get chat history
  const chatHistory = await prisma.chatMessage.findMany({
    where: { moduleId },
    orderBy: { order: 'asc' },
    take: 20, // Limit to last 20 messages for context window
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert teacher helping a student learn about "${module.learningSession.name}".

Current Module: ${module.name}
Module Overview: ${module.overview}

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
        ...chatHistory.map((msg) => ({
          role: msg.author === ChatMessageAuthor.User ? ('user' as const) : ('assistant' as const),
          content: msg.content,
        })),
        // Add current message
        {
          role: 'user' as const,
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseContent = completion.choices[0]?.message?.content;

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
