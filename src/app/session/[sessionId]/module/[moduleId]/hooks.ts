'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import { getMessages, createFollowUpQuestions } from '@/lib/actions/chatActions';
import { getModuleById, addCurrentFollowUps, getCurrentFollowUps, markModuleComplete, getModules } from '@/lib/actions/moduleActions';
import { Message } from '@/lib/ai/types';

interface UseAIChatOptions {
  moduleId: string;
  userId: string;
}

interface UseAIChatReturn {
  messages: Message[];
  streamingMessage: string;
  isStreaming: boolean;
  isGeneratingFollowUps: boolean;
  sendMessage: (content: string) => void;
  error: string | null;
}


/**
 * Custom hook for AI chat functionality within a module
 * Manages message state, streaming responses, and WebSocket communication
 */
export function useAIChat({ moduleId, userId }: UseAIChatOptions): UseAIChatReturn {
  const { emit, on, off, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGeneratingFollowUps, setIsGeneratingFollowUps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(
    (content: string) => {
      if (!isConnected) {
        setError('Not connected to server');
        return;
      }

      if (!content.trim()) {
        setError('Message cannot be empty');
        return;
      }

      // Add user message to local state immediately
      const userMessage: Message = {
        role: 'user',
        content: content.trim(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Clear any previous errors
      setError(null);
      setStreamingMessage('');
      setIsStreaming(true);

      // Emit message to server
      emit('ai:chat:generate', {
        moduleId,
        message: content.trim(),
        userId,
      });
    },
    [moduleId, userId, isConnected, emit]
  );

  // Set up event listeners
  useEffect(() => {
    // Handle streaming chunks
    const handleChunk = (data: { chunk: string }) => {
      setStreamingMessage((prev) => prev + data.chunk);
    };

    // Handle completion
    const handleComplete = async (data: { message: string; moduleId: string }) => {
      if (data.moduleId === moduleId) {
        // Add complete assistant message to messages
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
        };

        let updatedMessages: Message[] = [];
        setMessages((prev) => {
          updatedMessages = [...prev, assistantMessage];
          return updatedMessages;
        });

        // Reset streaming state
        setStreamingMessage('');
        setIsStreaming(false);

        // Start generating follow-up questions
        setIsGeneratingFollowUps(true);

        // Clear old follow-up questions immediately to show skeleton
        queryClient.resetQueries({ queryKey: ['currentFollowUps', moduleId] });

        // Generate and save follow-up questions after state is updated
        try {
          const result = await createFollowUpQuestions(moduleId, userId, 3);
          if (result?.questions) {
            await addCurrentFollowUps(moduleId, result.questions);
            // Invalidate to refetch and show new follow-ups
            queryClient.invalidateQueries({ queryKey: ['currentFollowUps', moduleId] });
          }
        } catch (err) {
          console.error('Failed to generate/save follow-up questions:', err);
        } finally {
          setIsGeneratingFollowUps(false);
        }
      }
    };

    // Handle errors
    const handleError = (data: { error: string }) => {
      setError(data.error);
      setIsStreaming(false);
      setStreamingMessage('');
    };

    // Register listeners
    on('ai:chat:chunk', handleChunk);
    on('ai:chat:complete', handleComplete);
    on('ai:chat:error', handleError);

    // Cleanup listeners on unmount
    return () => {
      off('ai:chat:chunk', handleChunk);
      off('ai:chat:complete', handleComplete);
      off('ai:chat:error', handleError);
    };
  }, [moduleId, on, off, queryClient]);

  return {
    messages,
    streamingMessage,
    isStreaming,
    isGeneratingFollowUps,
    sendMessage,
    error,
  };
}

/**
 * Custom hook to fetch and manage chat message history for a module
 * Retrieves all messages stored in the database for the given module
 */
export function useGetMessages(moduleId: string, userId: string) {
  return useQuery({
    queryKey: ['messages', moduleId],
    queryFn: () => getMessages(moduleId, userId),
    enabled: !!moduleId && !!userId,
  });
}

/**
 * Custom hook to fetch and manage module data
 * Retrieves module information including learning session context
 */
export function useGetModule(moduleId: string, userId: string) {
  return useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => getModuleById(moduleId, userId),
    enabled: !!moduleId && !!userId,
  });
}

/**
 * Custom hook to get current follow-up questions for a module
 * Retrieves the stored follow-up questions from the database
 */
export function useGetCurrentFollowUps(moduleId: string) {
  return useQuery({
    queryKey: ['currentFollowUps', moduleId],
    queryFn: () => getCurrentFollowUps(moduleId),
    enabled: !!moduleId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook to add follow-up questions to a module
 * Wraps the addCurrentFollowUps action in a mutation for state management
 */
export function useAddFollowUps(moduleId: string) {
  return useMutation({
    mutationFn: (followUps: unknown) => addCurrentFollowUps(moduleId, followUps),
  });
}

/**
 * Custom hook to mark a module as complete
 * Invalidates relevant queries to refresh UI state
 */
export function useMarkModuleComplete(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => markModuleComplete(moduleId, userId),
    onSuccess: (data, moduleId) => {
      // Invalidate module queries to refresh completion status
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });

      // Invalidate modules query to refresh the list
      if (data.module.learningSessionId) {
        queryClient.invalidateQueries({ queryKey: ['modules', data.module.learningSessionId] });
        // Invalidate session query to refresh module completion status on session page
        queryClient.invalidateQueries({ queryKey: ['session', data.module.learningSessionId] });
      }
    },
  });
}
