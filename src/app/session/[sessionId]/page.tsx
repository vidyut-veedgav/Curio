import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSessionById } from '@/lib/actions/sessionActions';
import { SessionProgressBar } from './components/SessionProgressBar';
import { SessionDescription } from './components/SessionDescription';
import { ModuleList } from './components/ModuleList';
import { Header } from '@/components/Header';

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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl p-8">
        {/* Back Button */}
        <Link href="/home" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </Link>

        {/* Header with Title and Progress */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{session.name}</h1>

          <SessionProgressBar
            completedModules={completedModules}
            totalModules={totalModules}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Session Description */}
          <div className="pr-24">
            <SessionDescription
              description={session.description}
              sessionName={session.name}
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
