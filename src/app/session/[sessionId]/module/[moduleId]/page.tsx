"use client";

import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./components/ChatMessage";
import { use } from "react";

// Mock data for demonstration
const mockMessages = [
  {
    id: "1",
    content: "Explain how a SAFE works in VC",
    author: "User" as const,
  },
  {
    id: "2",
    content: `A SAFE (Simple Agreement for Future Equity) is a financing instrument commonly used in early-stage startup funding. Here's how it works:

Basic Concept
A SAFE is essentially a contract where an investor gives money to a startup now, in exchange for the right to receive equity later when a specific triggering event occurs (usually a priced funding round).`,
    author: "AI" as const,
  },
  {
    id: "3",
    content: "Wow that is so cool! I'm super interested in SAFEs. When I grow up I want to become a venture capitalist! I love the idea of screwing people over.",
    author: "User" as const,
  },
];

interface ModulePageProps {
  params: Promise<{
    sessionId: string;
    moduleId: string;
  }>;
}

export default function ModulePage({ params }: ModulePageProps) {
  const { sessionId, moduleId } = use(params);

  // Static data for now - will be replaced with actual data fetching
  const sessionName = "Machine Learning Fundamentals";
  const moduleName = "Linear Algebra";

  return (
    <div className="h-screen bg-gradient-to-b from-background via-accent/5 to-accent/20 flex flex-col overflow-hidden">
      <Header />

      {/* Top Navigation Bar */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={`/session/${sessionId}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </Link>

          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground">{sessionName}</p>
            <h1 className="text-2xl font-semibold">{moduleName}</h1>
          </div>

          <Button variant="outline" size="default" className="rounded-lg">
            Mark as Complete
          </Button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col px-6">
          <ScrollArea className="flex-1 py-6">
            <div className="space-y-4">
              {mockMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  author={message.author}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Message Input Area */}
      <div className="border-t bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Type your message..."
              className="flex-1 h-12 rounded-full px-6 text-base"
            />
            <Button size="icon" className="h-12 w-12 rounded-full shrink-0">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
