"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessage } from "./ChatMessage";
import { AIPaneHeader } from "./AIPaneHeader";
import { AIPaneInput } from "./AIPaneInput";
import FollowUpQuestions from "./FollowUpQuestions";
import { useRef, useEffect, useMemo } from "react";
import { useAIChat, useGetMessages, useGetCurrentFollowUps } from "../../hooks";
import { Panel } from "react-resizable-panels";

interface AIPaneProps {
  moduleId: string;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIPane({ moduleId, userId, open, onOpenChange }: AIPaneProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  const getMessagesQuery = useGetMessages(moduleId, userId);

  // WebSocket AI chat integration
  const { messages, streamingMessage, isStreaming, isGeneratingFollowUps, sendMessage, error } = useAIChat({
    moduleId,
    userId,
  });

  // Combine database messages with WebSocket messages and streaming message for display
  const displayMessages = useMemo(() => {
    // Start with messages from database
    const dbMessages = getMessagesQuery.data || [];

    // Add WebSocket messages (from current session)
    const allMessages = [...dbMessages, ...messages];

    // Add streaming message if AI is currently responding
    if (isStreaming && streamingMessage) {
      allMessages.push({
        role: 'assistant' as const,
        content: streamingMessage,
      });
    }

    return allMessages;
  }, [getMessagesQuery.data, messages, streamingMessage, isStreaming]);

  // Fetch follow-up questions from database
  const followUpQuestionsQuery = useGetCurrentFollowUps(moduleId);

  const followUpQuestions = useMemo(() => {
    const questions = followUpQuestionsQuery.data;
    if (Array.isArray(questions)) {
      return questions as string[];
    }
    return [];
  }, [followUpQuestionsQuery.data]);

  // Auto-scroll to bottom when new messages arrive (not on every render)
  const messageCount = displayMessages.length;

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messageCount]); // Only scroll when message count changes, not on every keystroke

  if (!open) {
    return null;
  }

  return (
    <Panel defaultSize={40} minSize={20} maxSize={70} className="bg-background border-l flex flex-col overflow-hidden md:flex w-full md:w-auto">
      {/* Header */}
      <AIPaneHeader onClose={() => onOpenChange(false)} />

      {/* Chat Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto py-6 px-6 space-y-4">
        {getMessagesQuery.isLoading ? (
          <div className="space-y-8 py-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ) : (
          displayMessages.map((message, index) => (
            <ChatMessage
              key={`${message.role}-${index}`}
              content={message.content}
              role={message.role}
            />
          ))
        )}
        {error && (
          <div className="text-center text-destructive text-sm py-3">
            Error: {error}
          </div>
        )}

        {/* Follow-up Questions */}
        {!getMessagesQuery.isLoading && !isStreaming && displayMessages.length > 0 && (
          <div className="mt-6">
            <FollowUpQuestions
              questions={followUpQuestions}
              isLoading={followUpQuestionsQuery.isLoading || followUpQuestionsQuery.isFetching || isGeneratingFollowUps}
              onQuestionClick={sendMessage}
            />
          </div>
        )}
      </div>

      {/* Message Input Area */}
      <AIPaneInput onSendMessage={sendMessage} isStreaming={isStreaming} />
    </Panel>
  );
}
