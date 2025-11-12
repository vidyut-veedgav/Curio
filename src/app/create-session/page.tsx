'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionTopicInput } from './components/SessionTopicInput';
import { SessionLengthSelector } from './components/SessionLengthSelector';
import { SessionComplexitySelector } from './components/SessionComplexitySelector';

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
            <SessionTopicInput value={topic} onChange={setTopic} />

            <SessionLengthSelector value={length} onChange={setLength} />

            <SessionComplexitySelector value={complexity} onChange={setComplexity} />

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
