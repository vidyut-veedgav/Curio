"use client";

import { Header } from "@/components/Header";
import { SessionHeader } from "./components/SessionHeader";
import { AIPane } from "./components/AIPane";
import { Content } from "./components/Content";
import { use, useState } from "react";

interface ModulePageProps {
  params: Promise<{
    sessionId: string;
    moduleId: string;
  }>;
}

export default function ModulePage({ params }: ModulePageProps) {
  const { sessionId, moduleId } = use(params);
  const [isPaneOpen, setIsPaneOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      {/* Main Content Area - Flexbox layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Session Header + Module Content */}
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          <SessionHeader sessionId={sessionId} moduleId={moduleId} />
          <div className="flex-1 overflow-auto">
            <Content />
          </div>
        </div>

        {/* Right: AI Chat Pane */}
        <AIPane moduleId={moduleId} open={isPaneOpen} onOpenChange={setIsPaneOpen} />
      </div>
    </div>
  );
}
