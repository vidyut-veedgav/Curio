interface SessionProgressBarProps {
  completedModules: number;
  totalModules: number;
}

export function SessionProgressBar({ completedModules, totalModules }: SessionProgressBarProps) {
  const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm text-muted-foreground mb-1">
        <span>Progress</span>
        <span>{completedModules} of {totalModules} modules completed</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="text-right text-sm font-semibold text-primary mt-1">
        {progressPercentage}%
      </div>
    </div>
  );
}
