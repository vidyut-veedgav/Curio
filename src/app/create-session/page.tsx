'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function CreateSessionPage() {
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [complexity, setComplexity] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const handleCreate = () => {
    // TODO: Implement form submission logic
    console.log({ topic, length, complexity });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-4xl font-bold">Create Learning Session</h1>

        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Text Field */}
            <div className="space-y-2">
              <Label htmlFor="topic">What do you want to learn?</Label>
              <Textarea
                id="topic"
                placeholder="Describe the topic you'd like to learn about..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>

            {/* Session Length */}
            <div className="space-y-3">
              <Label>Session Length</Label>
              <RadioGroup
                value={length}
                onValueChange={(value) => setLength(value as 'short' | 'medium' | 'long')}
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

            {/* Complexity Level */}
            <div className="space-y-3">
              <Label>Complexity Level</Label>
              <RadioGroup
                value={complexity}
                onValueChange={(value) => setComplexity(value as 'beginner' | 'intermediate' | 'advanced')}
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

            {/* Create Button */}
            <div className="pt-4">
              <Button
                onClick={handleCreate}
                className="w-full"
                size="lg"
              >
                Create Learning Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
