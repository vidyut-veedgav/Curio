import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionDescriptionProps {
  description: string;
  originalPrompt?: string | null;
  sessionName: string;
  totalModules: number;
  inferredLength: 'short' | 'medium' | 'long';
}

export function SessionDescription({
  description,
  originalPrompt,
  sessionName,
  totalModules,
  inferredLength,
}: SessionDescriptionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About This Session</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Description</h3>
          <p className="text-base leading-relaxed">{description}</p>
        </div>

        {originalPrompt && originalPrompt !== sessionName && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Original Prompt</h3>
            <p className="text-sm text-muted-foreground italic">{originalPrompt}</p>
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Length</span>
            <span className="font-medium capitalize">{inferredLength}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Modules</span>
            <span className="font-medium">{totalModules}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
