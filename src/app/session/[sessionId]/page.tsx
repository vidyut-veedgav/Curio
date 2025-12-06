"use client";

import { use, useMemo } from 'react';
import { notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SessionHeader } from './components/SessionHeader';
import { SessionDescription } from './components/SessionDescription';
import { ModuleList } from './components/ModuleList';
import { Header } from '@/components/Header';
import { Spinner } from '@/components/ui/spinner';
import { useGetSession, useDeleteSession } from './hooks';

interface SessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = use(params);
  const { status: sessionStatus } = useSession();

  const getSessionQuery = useGetSession(sessionId);
  const deleteSessionMutation = useDeleteSession();

  const sessionData = useMemo(() => {
    if (!getSessionQuery.data) return null;

    const session = getSessionQuery.data;
    const totalModules = session.modules.length;
    const completedModules = session.modules.filter((m) => m.isComplete).length;

    // Infer length from module count (based on sessionService.ts:119)
    const inferredLength: 'short' | 'medium' | 'long' =
      totalModules <= 3 ? 'short' :
      totalModules <= 5 ? 'medium' :
      'long';

    return {
      session,
      totalModules,
      completedModules,
      inferredLength,
    };
  }, [getSessionQuery.data]);

  // Show loading while auth session or query is loading
  if (sessionStatus === 'loading' || getSessionQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="size-12" />
        </div>
      </div>
    );
  }

  if (!sessionData) {
    notFound();
  }

  const { session, totalModules, completedModules, inferredLength } = sessionData;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl p-8">
        <SessionHeader
          sessionName={session.name}
          sessionId={sessionId}
          completedModules={completedModules}
          totalModules={totalModules}
          onDelete={() => deleteSessionMutation.mutate(sessionId)}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Session Description */}
          <div className="pr-24">
            <SessionDescription
              description={session.description}
              sessionName={session.name}
              inferredLength={inferredLength}
              lastUpdated={session.lastUpdated}
            />
          </div>

          {/* Right Side - Module List */}
          <div>
            <ModuleList
              sessionId={sessionId}
              modules={session.modules}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
