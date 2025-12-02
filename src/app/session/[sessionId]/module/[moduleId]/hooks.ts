'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import { Message, getMessages, createFollowUpQuestions } from '@/lib/actions/chatActions';
import { getModuleById } from '@/lib/actions/moduleActions';

interface UseAIChatOptions {
  moduleId: string;
}

interface UseAIChatReturn {
  messages: Message[];
  streamingMessage: string;
  isStreaming: boolean;
  sendMessage: (content: string) => void;
  error: string | null;
}


/**
 * Custom hook for AI chat functionality within a module
 * Manages message state, streaming responses, and WebSocket communication
 */
export function useAIChat({ moduleId }: UseAIChatOptions): UseAIChatReturn {
  const { emit, on, off, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
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
      });
    },
    [moduleId, isConnected, emit]
  );

  // Set up event listeners
  useEffect(() => {
    // Handle streaming chunks
    const handleChunk = (data: { chunk: string }) => {
      setStreamingMessage((prev) => prev + data.chunk);
    };

    // Handle completion
    const handleComplete = (data: { message: string; moduleId: string }) => {
      if (data.moduleId === moduleId) {
        // Add complete assistant message to messages
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Reset streaming state
        setStreamingMessage('');
        setIsStreaming(false);
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
  }, [moduleId, on, off]);

  return {
    messages,
    streamingMessage,
    isStreaming,
    sendMessage,
    error,
  };
}

/**
 * Custom hook to fetch and manage chat message history for a module
 * Retrieves all messages stored in the database for the given module
 */
export function useGetMessages(moduleId: string) {
  return useQuery({
    queryKey: ['messages', moduleId],
    queryFn: () => getMessages(moduleId),
    enabled: !!moduleId,
  });
}

/**
 * Custom hook to fetch and manage module data
 * Retrieves module information including learning session context
 */
export function useGetModule(moduleId: string) {
  return useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => getModuleById(moduleId),
    enabled: !!moduleId,
  });
}

/**
 * Custom hook to generate follow-up questions based on conversation history
 * Uses AI to create contextually relevant questions from the message history
 */
export function useCreateFollowUpQuestions(messages: Message[], numQuestions: number = 3) {
  return useQuery({
    queryKey: ['followUpQuestions', messages.length, numQuestions],
    queryFn: () => createFollowUpQuestions(messages, numQuestions),
    enabled: messages.length > 0,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}
