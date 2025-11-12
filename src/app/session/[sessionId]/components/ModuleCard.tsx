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
      <div className="group relative border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
        {/* Module Number Badge */}
        <div className="absolute -left-3 -top-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
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

            {/* Completion Status */}
            {isComplete && (
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs font-medium">Complete</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
