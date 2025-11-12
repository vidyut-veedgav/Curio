import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <CardTitle>Learning Modules</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
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
      </CardContent>
    </Card>
  );
}
