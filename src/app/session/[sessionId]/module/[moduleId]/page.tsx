"use client";

import { ArrowLeft, ArrowUp, Check } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessage } from "./components/ChatMessage";
import { use, useState, useRef, useEffect, useMemo } from "react";
import { useAIChat, useGetMessages, useGetModule } from "./hooks";

interface ModulePageProps {
  params: Promise<{
    sessionId: string;
    moduleId: string;
  }>;
}

export default function ModulePage({ params }: ModulePageProps) {
  const { sessionId, moduleId } = use(params);
  const [inputValue, setInputValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch module data and chat history
  const getModuleQuery = useGetModule(moduleId);
  const getMessagesQuery = useGetMessages(moduleId);

  // WebSocket AI chat integration
  const { messages, streamingMessage, isStreaming, sendMessage, error } = useAIChat({
    moduleId,
  });

  // Extract module and session names from fetched data
  const sessionName = getModuleQuery.data?.learningSession?.name || "Loading...";
  const moduleName = getModuleQuery.data?.name || "Loading...";

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [displayMessages]);

  // Handle message submission
  const handleSendMessage = () => {
    if (!inputValue.trim() || isStreaming) return;

    sendMessage(inputValue);
    setInputValue("");
  };

  // Handle Enter key (without shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      {/* Top Navigation Bar */}
      <div className="bg-background flex justify-center border-b">
        <div className="w-full max-w-4xl px-6">
          <div className="pt-8 pb-8 flex items-center justify-between">
            <div className="flex flex-col items-start gap-2">
              {getModuleQuery.isLoading ? (
                <>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-64" />
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">{sessionName}</p>
                  <h1 className="text-2xl font-semibold">{moduleName}</h1>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/session/${sessionId}`}>
                <Button variant="outline" size="default" className="rounded-lg">
                  <ArrowLeft className="h-4 w-4" />
                  Course
                </Button>
              </Link>
              <Button size="default" className="rounded-lg">
                <Check className="h-4 w-4" />
                Complete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="flex justify-center py-6">
          <div className="w-full max-w-4xl px-6">
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
              ) : displayMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <p>Start a conversation by asking a question below.</p>
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
                <div className="text-center text-destructive text-sm py-2">
                  Error: {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Message Input Area */}
      <div className="flex justify-center pb-6">
        <div className="w-full max-w-4xl px-6">
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question..."
              className="w-full !text-base resize-none rounded-xl px-5 py-3 pr-12 shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[72px] max-h-[200px]"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 rounded-full shrink-0"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isStreaming}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
