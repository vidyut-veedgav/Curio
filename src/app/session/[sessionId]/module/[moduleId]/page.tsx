"use client";

import { ArrowLeft, ArrowUp, Check } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
    content: "Wow that is so cool! I'm super interested in SAFEs. When I grow up I want to become a venture capitalist! I love the idea of investing in the future.",
    author: "User" as const,
  },
  {
    id: "4",
    content: "What are the main advantages of using a SAFE versus a convertible note?",
    author: "User" as const,
  },
  {
    id: "5",
    content: `The main advantages of SAFEs over convertible notes are:
- No interest accrues, as SAFEs are not debt.
- No maturity date, removing pressure to convert within a set time.
- Docs are simpler and usually more friendly to founders (and often investors too).
However, some investors may still prefer notes for certain protections.`,
    author: "AI" as const,
  },
  {
    id: "6",
    content: "Can SAFEs be used in later-stage funding rounds too?",
    author: "User" as const,
  },
  {
    id: "7",
    content: `While SAFEs are most common in early-stage rounds (pre-seed and seed), they can theoretically be used at any stage. However, later stage investors generally prefer priced equity rounds for structure and clarity.`,
    author: "AI" as const,
  },
  {
    id: "8",
    content: "Thank you for the explanation! Can you give me an example calculation of how a SAFE converts?",
    author: "User" as const,
  },
  {
    id: "9",
    content: `Sure! Let's say:
- You invest $100,000 with a SAFE at a $2M valuation cap.
- Later, a Series A happens at a $4M pre-money valuation.
At that round, your $100,000 would convert to equity as if you'd invested at a $2M valuation, not $4M, granting you more shares. ($100,000 ÷ $2,000,000 = 5% ownership).`,
    author: "AI" as const,
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
  const moduleName = "2. Linear Algebra";

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      {/* Top Navigation Bar */}
      <div className="bg-background flex justify-center border-b">
        <div className="w-full max-w-4xl px-6">
          <div className="pt-8 pb-8 flex items-center justify-between">
            <div className="flex flex-col items-start">
              <p className="text-sm text-muted-foreground">{sessionName}</p>
              <h1 className="text-2xl font-semibold">{moduleName}</h1>
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
      <ScrollArea className="flex-1">
        <div className="flex justify-center py-6">
          <div className="w-full max-w-4xl px-6">
            <div className="space-y-4">
              {mockMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  author={message.author}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Message Input Area */}
      <div className="flex justify-center pb-6">
        <div className="w-full max-w-4xl px-6">
          <div className="relative">
            <Textarea
              placeholder="Ask a follow-up question..."
              className="w-full !text-base resize-none rounded-xl px-5 py-3 pr-12 shadow-md focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[72px] max-h-[200px]"
              rows={1}
            />
            <Button
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 rounded-full shrink-0"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
