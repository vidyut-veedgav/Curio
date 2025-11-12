import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SessionCardProps {
  title: string;
  progress: number;
  modulesCompleted: number;
  totalModules: number;
}

export function SessionCard({ title, progress, modulesCompleted, totalModules }: SessionCardProps) {
  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
          <span className="text-lg font-semibold">{progress}%</span>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {modulesCompleted}/{totalModules} Modules Completed
        </p>
      </CardContent>
    </Card>
  );
}
