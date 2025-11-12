import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SessionTopicInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SessionTopicInput({ value, onChange }: SessionTopicInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="topic">What do you want to learn?</Label>
      <Textarea
        id="topic"
        placeholder="Describe the topic you'd like to learn about..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[150px] resize-none"
      />
    </div>
  );
}
