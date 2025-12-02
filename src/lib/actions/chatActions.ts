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

/**
 * Generates follow-up questions based on conversation history
 */
export async function createFollowUpQuestions(
  messages: Message[],
  numQuestions: number = 3
): Promise<{ questions: string[] }> {
  try {
    // Use last 10 messages for context (or all if fewer than 10)
    const contextMessages = messages.slice(-10);

    // Initialize OpenAI provider
    const provider = new OpenAIProvider('gpt-4o-mini');

    // Prepare the prompt for generating follow-up questions
    const systemPrompt: Message = {
      role: 'assistant',
      content: `You are an AI tutor helping students learn. Based on the conversation history, generate exactly ${numQuestions} thought-provoking follow-up questions that:
1. Deepen understanding of the current topic
2. Explore related concepts and connections
3. Encourage practical application
4. Build on what has been discussed
5. Are clear, concise, and pedagogically valuable

Return ONLY a valid JSON object in this exact format:
{
  "questions": [
    "Question 1",
    "Question 2",
    ...
  ]
}

Generate exactly ${numQuestions} questions. Do not include any additional text or explanation outside the JSON object.`
    };

    // Combine system prompt with conversation context
    const promptMessages: Message[] = [systemPrompt, ...contextMessages];

    // Call OpenAI to generate questions
    const response = await provider.complete(promptMessages, {
      temperature: 0.7,
      maxTokens: 500,
      responseFormat: 'json_object',
    });

    // Parse the JSON response
    const parsedResponse = JSON.parse(response);

    // Validate response structure
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid response format from AI');
    }

    // Ensure we have the requested number of questions
    const questions = parsedResponse.questions.slice(0, numQuestions);

    if (questions.length < numQuestions) {
      throw new Error('AI did not generate enough questions');
    }

    return { questions };

  } catch (error) {
    console.error('Error generating follow-up questions:', error);

    // Fallback to generic questions if AI fails
    const fallbackQuestions = [
      "Can you explain this concept in a different way?",
      "How does this relate to real-world applications?",
      "What are some common misconceptions about this topic?",
      "Can you provide an example to illustrate this?",
      "What should I learn next to build on this knowledge?"
    ];

    return {
      questions: fallbackQuestions.slice(0, numQuestions)
    };
  }
}