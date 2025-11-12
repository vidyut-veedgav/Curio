import { notFound } from 'next/navigation';
import { getSessionById } from '@/lib/services/sessionService';
import { SessionProgressBar } from './components/SessionProgressBar';
import { SessionDescription } from './components/SessionDescription';
import { ModuleList } from './components/ModuleList';

interface SessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;
  const session = await getSessionById(sessionId);

  if (!session) {
    notFound();
  }

  // Calculate progress
  const totalModules = session.modules.length;
  const completedModules = session.modules.filter((m) => m.isComplete).length;

  // Infer length from module count (based on sessionService.ts:119)
  const inferredLength =
    totalModules <= 3 ? 'short' :
    totalModules <= 5 ? 'medium' :
    'long';

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header with Title and Progress */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{session.name}</h1>

          <SessionProgressBar
            completedModules={completedModules}
            totalModules={totalModules}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Session Description */}
          <div>
            <SessionDescription
              description={session.description}
              originalPrompt={session.originalPrompt}
              sessionName={session.name}
              totalModules={totalModules}
              inferredLength={inferredLength}
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
