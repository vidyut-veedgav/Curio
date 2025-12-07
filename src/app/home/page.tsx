"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "../../components/Header";
import { SessionList } from "./components/SessionList";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Menu } from "lucide-react";
import { useGetUser } from "@/hooks/useGetUser";
import { useGetSessions, useCreateSession } from "./hooks";

export default function HomePage() {
  const { data: session, status: sessionStatus } = useSession();

  const userId = session?.user?.id || "";

  const getUserQuery = useGetUser(userId);
  const getSessionsQuery = useGetSessions(userId);
  const createSessionMutation = useCreateSession();

  const firstName = useMemo(() => {
    if (getUserQuery.data?.name) {
      const [first] = getUserQuery.data.name.trim().split(/\s+/);
      return first || null;
    }

    if (getUserQuery.data?.email) {
      return getUserQuery.data.email.split("@")[0];
    }

    return null;
  }, [getUserQuery.data]);

  const sessionData = useMemo(() => {
    if (!getSessionsQuery.data) return [];

    return getSessionsQuery.data.map(session => {
      const totalModules = session.modules.length;
      const modulesCompleted = session.modules.filter(m => m.isComplete).length;
      const progress = totalModules > 0 ? Math.round((modulesCompleted / totalModules) * 100) : 0;

      return {
        id: session.id,
        title: session.name,
        progress,
        modulesCompleted,
        totalModules,
      };
    });
  }, [getSessionsQuery.data]);

  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "long">("short");
  const [complexity, setComplexity] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoading = sessionStatus === "loading" || getUserQuery.isLoading;
  const isCreatingSession = createSessionMutation.isPending;

  const handleCreateSession = () => {
    if (!userId || !topic.trim()) return;

    createSessionMutation.mutate({
      userId,
      topic: topic.trim(),
      length,
      complexity,
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-b from-background via-accent/5 to-accent/20 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="size-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-background via-accent/5 to-accent/20 flex flex-col overflow-hidden">
      <Header />

      {/* Loading Overlay for Session Creation */}
      {isCreatingSession && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center">
          <div className="bg-background rounded-lg p-6 sm:p-8 mx-4 flex flex-col items-center gap-4 shadow-xl max-w-md">
            <Spinner className="size-12" />
            <p className="text-base sm:text-lg font-medium text-center">Hold tight while your learning session generates...</p>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <SessionList
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sessionData={sessionData}
          isLoading={getSessionsQuery.isLoading}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toggle Button */}
          {!sidebarOpen && (
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
              <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)} className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          )}

          <main className="flex-1 flex justify-center px-4 sm:px-6 pt-16 sm:pt-24">
            <div className="w-full max-w-3xl flex flex-col items-center space-y-10 sm:space-y-8 md:space-y-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-primary max-w-2xl px-4">
                {firstName ? `What do you want to learn today, ${firstName}?` : "What do you want to learn today?"}
              </h1>

              <Textarea
                placeholder="Ask Curio to teach you anything..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isCreatingSession}
                className="w-full max-w-2xl h-32 !text-lg resize-none rounded-2xl px-4 py-4 shadow-lg focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              <RadioGroup
                value={length}
                onValueChange={(value) => setLength(value as "short" | "medium" | "long")}
                disabled={isCreatingSession}
                className="flex flex-wrap justify-center gap-4 sm:gap-8"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id="short" />
                  <Label htmlFor="short" className="text-base cursor-pointer">Short</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-base cursor-pointer">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="long" id="long" />
                  <Label htmlFor="long" className="text-base cursor-pointer">Long</Label>
                </div>
              </RadioGroup>

              <RadioGroup
                value={complexity}
                onValueChange={(value) => setComplexity(value as "beginner" | "intermediate" | "advanced")}
                disabled={isCreatingSession}
                className="flex flex-wrap justify-center gap-4 sm:gap-8"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="text-base cursor-pointer">Beginner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="text-base cursor-pointer">Intermediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="text-base cursor-pointer">Advanced</Label>
                </div>
              </RadioGroup>

              <Button
                size="lg"
                className="w-full max-w-2xl h-14 text-base font-semibold"
                onClick={handleCreateSession}
                disabled={isCreatingSession || !topic.trim()}
              >
                Create Learning Session
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
