"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SessionCard } from "./SessionCard";

interface SessionData {
  id: string;
  title: string;
  progress: number;
  modulesCompleted: number;
  totalModules: number;
}

interface SessionListProps {
  open: boolean;
  onClose: () => void;
  sessionData: SessionData[];
  isLoading: boolean;
}

export function SessionList({ open, onClose, sessionData, isLoading }: SessionListProps) {
  return (
    <aside className={`${open ? "w-full md:w-[480px]" : "w-0"} transition-all duration-300 overflow-hidden border-r bg-background fixed md:relative h-full z-50 md:z-auto`}>
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Learning Sessions</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading sessions...</p>
          ) : sessionData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No learning sessions yet. Create one to get started!</p>
          ) : (
            sessionData.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                title={session.title}
                progress={session.progress}
                modulesCompleted={session.modulesCompleted}
                totalModules={session.totalModules}
              />
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
