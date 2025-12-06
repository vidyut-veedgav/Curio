"use client";

import { Header } from "@/components/Header";
import { ModuleHeader } from "./components/ModuleHeader";
import { AIPane } from "./components/ai_pane/AIPane";
import { Content } from "./components/Content";
import { use, useState } from "react";
import { useSession } from "next-auth/react";

interface ModulePageProps {
  params: Promise<{
    sessionId: string;
    moduleId: string;
  }>;
}

export default function ModulePage({ params }: ModulePageProps) {
  const { sessionId, moduleId } = use(params);
  const { data: session } = useSession();
  const userId = session?.user?.id || "";
  const [isPaneOpen, setIsPaneOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      {/* Main Content Area - Flexbox layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Session Header + Module Content */}
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          <ModuleHeader sessionId={sessionId} moduleId={moduleId} isPaneOpen={isPaneOpen} onTogglePane={() => setIsPaneOpen(!isPaneOpen)} />
          <div className="flex-1 overflow-auto">
            <Content moduleId={moduleId} />
          </div>
        </div>

        {/* Right: AI Chat Pane */}
        <AIPane moduleId={moduleId} userId={userId} open={isPaneOpen} onOpenChange={setIsPaneOpen} />
      </div>
    </div>
  );
}
