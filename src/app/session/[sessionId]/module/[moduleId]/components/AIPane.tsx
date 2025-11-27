"use client";

import { ArrowUp, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatMessage } from "./ChatMessage";
import { useState, useRef, useEffect, useMemo } from "react";
import { useAIChat, useGetMessages } from "../hooks";
import { cn } from "@/lib/utils";

interface AIPaneProps {
  moduleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIPane({ moduleId, open, onOpenChange }: AIPaneProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  const getMessagesQuery = useGetMessages(moduleId);

  // WebSocket AI chat integration
  const { messages, streamingMessage, isStreaming, sendMessage, error } = useAIChat({
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

  // Handle message submission
  const handleSendMessage = () => {
    if (!inputValue.trim() || isStreaming) return;

    sendMessage(inputValue);
    setInputValue("");
  };

  // Handle Enter key (without shift for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={cn(
        "w-full sm:max-w-2xl bg-background border-l transition-all duration-300 ease-in-out flex flex-col",
        open ? "flex" : "hidden"
      )}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 z-10"
        onClick={() => onOpenChange(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="flex justify-center py-6">
            <div className="w-full max-w-2xl px-6">
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
                  <div className="text-center text-destructive text-sm py-3">
                    Error: {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Message Input Area */}
        <div className="flex justify-center pb-6">
          <div className="w-full max-w-2xl px-6">
            <InputGroup className="min-h-[60px]">
              <InputGroupTextarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask, Search or Chat..."
                disabled={isStreaming}
                className="min-h-0"
              />
              <InputGroupAddon align="block-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton variant="ghost">{selectedModel}</InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="start"
                    className="[--radius:0.95rem]"
                  >
                    <DropdownMenuItem onClick={() => setSelectedModel("gpt-4o-mini")}>
                      gpt-4o-mini
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedModel("gpt-4o")}>
                      gpt-4o
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedModel("gpt-4-turbo")}>
                      gpt-4-turbo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <InputGroupButton
                  variant="default"
                  className="rounded-full ml-auto"
                  size="icon-xs"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isStreaming}
                >
                  <ArrowUp />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
    </div>
  );
}
