import { Socket } from 'socket.io';
import { OpenAIProvider } from '@/lib/ai/providers/openai';
import { addMessage, getMessages, Message } from '@/lib/actions/chatActions';

export interface AIChatGenerationData {
  moduleId: string;
  message: string;
}

/**
 * Handles real-time AI chat generation via WebSocket
 * Streams AI responses back to the client as chunks
 */
export async function handleAIChatGeneration(
  socket: Socket,
  data: AIChatGenerationData
): Promise<void> {
  const { moduleId, message } = data;

  try {
    // Validate input
    if (!moduleId || !message?.trim()) {
      socket.emit('ai:chat:error', { error: 'Invalid moduleId or message' });
      return;
    }

    // Save user message to database
    const userMessage: Message = {
      role: 'user',
      content: message.trim(),
    };
    await addMessage(moduleId, userMessage);

    // Get conversation history
    const conversationHistory = await getMessages(moduleId);

    // Initialize OpenAI provider
    const provider = new OpenAIProvider('gpt-4o-mini');

    // Add system message with formatting instructions
    const systemMessage = {
      role: 'system' as const,
      content: `When generating mathematical equations, use proper markdown math syntax:
- For inline math: $equation$
- For display/block math: $$equation$$

Example: $$\\text{Precision} = \\frac{\\text{True Positives}}{\\text{True Positives} + \\text{False Positives}}$$`,
    };

    // Convert to OpenAI message format
    const aiMessages = [
      systemMessage,
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
    ];

    // Stream AI response
    let fullResponse = '';

    for await (const chunk of provider.stream(aiMessages, {
      temperature: 0.7,
      maxTokens: 500,
    })) {
      fullResponse += chunk;
      // Emit each chunk to the client
      socket.emit('ai:chat:chunk', { chunk });
    }

    // Save complete AI response to database
    const assistantMessage: Message = {
      role: 'assistant',
      content: fullResponse,
    };
    await addMessage(moduleId, assistantMessage);

    // Notify client that generation is complete
    socket.emit('ai:chat:complete', {
      message: fullResponse,
      moduleId,
    });

  } catch (error) {
    console.error('AI chat generation error:', error);
    socket.emit('ai:chat:error', {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}