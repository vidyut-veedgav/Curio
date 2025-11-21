import Link from 'next/link';

interface ModuleCardProps {
  sessionId: string;
  moduleId: string;
  moduleName: string;
  moduleOverview: string;
  moduleOrder: number;
  isComplete: boolean;
}

export function ModuleCard({
  sessionId,
  moduleId,
  moduleName,
  moduleOverview,
  moduleOrder,
  isComplete,
}: ModuleCardProps) {
  return (
    <Link href={`/session/${sessionId}/module/${moduleId}`}>
      <div className="group relative border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer mb-4">
        {/* Module Number Badge */}
        <div className={`absolute -left-3 -top-3 w-8 h-8 ${isComplete ? 'bg-green-600 dark:bg-green-500' : 'bg-primary'} text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm`}>
          {moduleOrder + 1}
        </div>

        {/* Module Content */}
        <div className="pl-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors mb-2">
                {moduleName}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {moduleOverview}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
