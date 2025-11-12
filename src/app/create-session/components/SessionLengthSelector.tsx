import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SessionLengthSelectorProps {
  value: 'short' | 'medium' | 'long';
  onChange: (value: 'short' | 'medium' | 'long') => void;
}

export function SessionLengthSelector({ value, onChange }: SessionLengthSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Session Length</Label>
      <RadioGroup
        value={value}
        onValueChange={(value) => onChange(value as 'short' | 'medium' | 'long')}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="short" id="short" />
          <Label htmlFor="short" className="font-normal cursor-pointer">
            Short
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="medium" id="medium" />
          <Label htmlFor="medium" className="font-normal cursor-pointer">
            Medium
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="long" id="long" />
          <Label htmlFor="long" className="font-normal cursor-pointer">
            Long
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
