import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SessionComplexitySelectorProps {
  value: 'beginner' | 'intermediate' | 'advanced';
  onChange: (value: 'beginner' | 'intermediate' | 'advanced') => void;
}

export function SessionComplexitySelector({ value, onChange }: SessionComplexitySelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Complexity Level</Label>
      <RadioGroup
        value={value}
        onValueChange={(value) => onChange(value as 'beginner' | 'intermediate' | 'advanced')}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="beginner" id="beginner" />
          <Label htmlFor="beginner" className="font-normal cursor-pointer">
            Beginner
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="intermediate" id="intermediate" />
          <Label htmlFor="intermediate" className="font-normal cursor-pointer">
            Intermediate
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="advanced" id="advanced" />
          <Label htmlFor="advanced" className="font-normal cursor-pointer">
            Advanced
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
