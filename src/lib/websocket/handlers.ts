import { Socket } from 'socket.io';
import { OpenAIProvider } from '@/lib/ai/providers/openai';
import { addMessage, getMessages, Message } from '@/lib/actions/chatActions';
import { getModuleById } from '@/lib/actions/moduleActions';
import { getUserData } from '@/lib/actions/userActions';
import { getPrompt } from '@/lib/prompts';

export interface AIChatGenerationData {
  moduleId: string;
  message: string;
  userId: string;
}

/**
 * Handles real-time AI chat generation via WebSocket
 * Streams AI responses back to the client as chunks
 */
export async function handleAIChatGeneration(
  socket: Socket,
  data: AIChatGenerationData
): Promise<void> {
  const { moduleId, message, userId } = data;

  try {
    // Validate input
    if (!moduleId || !message?.trim() || !userId) {
      socket.emit('ai:chat:error', { error: 'Invalid moduleId, message, or userId' });
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

    // Get module context for AI prompt
    const moduleContext = await getModuleById(moduleId);
    if (!moduleContext) {
      socket.emit('ai:chat:error', { error: 'Module not found' });
      return;
    }

    // Get user data for bio and name
    const userData = await getUserData(userId);
    const userName = userData.name || 'Student';
    const userBio = userData.bio || 'No bio provided yet.';

    // Format all modules list for prompt
    const allModulesFormatted = moduleContext.learningSession.modules
      .map((mod) => `${mod.order}. **${mod.name}**: ${mod.overview}`)
      .join('\n');

    // Load context-aware system prompt
    const promptVariables = {
      moduleName: moduleContext.name,
      sessionName: moduleContext.learningSession.name,
      sessionDescription: moduleContext.learningSession.description,
      allModules: allModulesFormatted,
      moduleOrder: String(moduleContext.order),
      moduleOverview: moduleContext.overview,
      moduleContent: moduleContext.content,
      userName: userName,
      userBio: userBio,
    };

    // Debug logging to verify context is loaded
    console.log('[AI Context Debug]', {
      moduleName: promptVariables.moduleName,
      sessionName: promptVariables.sessionName,
      moduleContentLength: promptVariables.moduleContent.length,
      allModulesCount: moduleContext.learningSession.modules.length,
      userName: promptVariables.userName,
      userBio: promptVariables.userBio,
    });

    const { system: systemPromptContent } = getPrompt('tutorSystemPrompt.md', promptVariables);

    // Debug: Log first 500 chars of system prompt to verify interpolation
    console.log('[System Prompt Preview]', systemPromptContent.substring(0, 500));

    // Initialize OpenAI provider
    const provider = new OpenAIProvider('gpt-4o-mini');

    // Create system message with context-aware prompt
    const systemMessage = {
      role: 'system' as const,
      content: systemPromptContent,
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