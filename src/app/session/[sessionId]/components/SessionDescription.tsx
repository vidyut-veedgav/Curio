import { formatDate } from '@/lib/utils';

interface SessionDescriptionProps {
  description: string;
  sessionName: string;
  inferredLength: 'short' | 'medium' | 'long';
  lastUpdated: Date;
}

export function SessionDescription({
  description,
  inferredLength,
  lastUpdated,
}: SessionDescriptionProps) {
  return (
    <div className="py-6">
      {/* <h2 className="text-xl font-semibold mb-4">About This Session</h2> */}
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">Description</h3>
          <p className="text-base leading-relaxed">{description}</p>
        </div>

        <div className="pt-6 border-t space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Length</span>
            <span className="text-sm capitalize">{inferredLength}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last Updated</span>
            <span className="text-sm">{formatDate(lastUpdated)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
