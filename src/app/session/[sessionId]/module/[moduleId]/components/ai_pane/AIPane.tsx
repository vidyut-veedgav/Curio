"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { ChatMessage } from "./ChatMessage";
import { AIPaneHeader } from "./AIPaneHeader";
import { AIPaneInput } from "./AIPaneInput";
import FollowUpQuestions from "./FollowUpQuestions";
import { useRef, useEffect, useMemo } from "react";
import { useAIChat, useGetMessages, useGetCurrentFollowUps } from "../../hooks";
import { cn } from "@/lib/utils";

interface AIPaneProps {
  moduleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIPane({ moduleId, open, onOpenChange }: AIPaneProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  const getMessagesQuery = useGetMessages(moduleId);

  // WebSocket AI chat integration
  const { messages, streamingMessage, isStreaming, isGeneratingFollowUps, sendMessage, error } = useAIChat({
    moduleId,
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
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messageCount]); // Only scroll when message count changes, not on every keystroke

  return (
    <>
      {/* Collapsed sidebar with AI button */}
      {!open && (
        <div className="w-12 bg-background border-l flex items-start justify-center pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(true)}
            className="h-8 w-8 group"
          >
            <Image
              src="/icons/ai.png"
              alt="AI"
              width={20}
              height={20}
              className="group-hover:brightness-0 group-hover:invert transition-all"
            />
            <span className="sr-only">Open AI Tutor</span>
          </Button>
        </div>
      )}

      {/* Expanded AI Pane */}
      <div
        className={cn(
          "bg-background border-l flex flex-col overflow-hidden transition-all duration-500 ease-in-out",
          open ? "w-full sm:w-[42rem]" : "w-0"
        )}
      >
        {/* Header */}
        <AIPaneHeader onClose={() => onOpenChange(false)} />

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="flex justify-center py-6">
            <div className="w-[calc(100%-1rem)] max-w-2xl px-6">
              <div className="space-y-4">
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
            </div>
          </div>
        </ScrollArea>

        {/* Message Input Area */}
        <AIPaneInput onSendMessage={sendMessage} isStreaming={isStreaming} />
      </div>
    </>
  );
}
