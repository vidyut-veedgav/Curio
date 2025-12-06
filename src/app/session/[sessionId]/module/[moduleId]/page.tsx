"use client";

import { Header } from "@/components/Header";
import { ModuleHeader } from "./components/ModuleHeader";
import { AIPane } from "./components/ai_pane/AIPane";
import { Content } from "./components/Content";
import { use, useState } from "react";
import { useSession } from "next-auth/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

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

      {/* Main Content Area - Resizable Panels */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left: Session Header + Module Content */}
        <Panel defaultSize={60} minSize={30}>
          <div className="h-full flex flex-col overflow-hidden">
            <ModuleHeader sessionId={sessionId} moduleId={moduleId} isPaneOpen={isPaneOpen} onTogglePane={() => setIsPaneOpen(!isPaneOpen)} />
            <div className="flex-1 overflow-auto">
              <Content moduleId={moduleId} />
            </div>
          </div>
        </Panel>

        {/* Resize Handle - only visible when pane is open */}
        {isPaneOpen && (
          <PanelResizeHandle className="w-1 bg-border cursor-col-resize" />
        )}

        {/* Right: AI Chat Pane - handles its own Panel wrapper */}
        <AIPane moduleId={moduleId} userId={userId} open={isPaneOpen} onOpenChange={setIsPaneOpen} />
      </PanelGroup>
    </div>
  );
}
