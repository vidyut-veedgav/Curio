import { ModuleCard } from './ModuleCard';

interface Module {
  id: string;
  name: string;
  overview: string;
  order: number;
  isComplete: boolean;
}

interface ModuleListProps {
  sessionId: string;
  modules: Module[];
}

export function ModuleList({ sessionId, modules }: ModuleListProps) {
  return (
    <div className="py-6">
      {/* <h2 className="text-xl font-semibold mb-4">Learning Modules</h2> */}
      <div>
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              sessionId={sessionId}
              moduleId={module.id}
              moduleName={module.name}
              moduleOverview={module.overview}
              moduleOrder={module.order}
              isComplete={module.isComplete}
            />
          ))}
        </div>

        {modules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No modules available for this session.</p>
          </div>
        )}
      </div>
    </div>
  );
}
