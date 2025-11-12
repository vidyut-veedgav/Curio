import { Header } from "./components/Header";
import { SessionCard } from "./components/SessionCard";
import { AddSessionButton } from "./components/AddSessionButton";

const mockSessions = [
  { id: 1, title: "Operating Systems", progress: 34, modulesCompleted: 7, totalModules: 20 },
  { id: 2, title: "Building Apps with AI", progress: 78, modulesCompleted: 14, totalModules: 18 },
  { id: 3, title: "Woodworking from Scratch", progress: 50, modulesCompleted: 10, totalModules: 20 },
  { id: 4, title: "Swedish Architecture", progress: 11, modulesCompleted: 2, totalModules: 18 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {mockSessions.map((session) => (
            <SessionCard
              key={session.id}
              title={session.title}
              progress={session.progress}
              modulesCompleted={session.modulesCompleted}
              totalModules={session.totalModules}
            />
          ))}
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <AddSessionButton />
      </div>
    </div>
  );
}
