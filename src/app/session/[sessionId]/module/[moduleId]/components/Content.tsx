'use client';

import { useSession } from 'next-auth/react';
import { useGetModule } from '../hooks';
import MarkdownRenderer from '@/app/MarkdownRenderer';

interface ContentProps {
  moduleId: string;
}

export function Content({ moduleId }: ContentProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id || "";

  const getModuleQuery = useGetModule(moduleId, userId);

  if (getModuleQuery.isLoading) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-4xl px-6 py-8">
          <p className="text-muted-foreground text-center">Loading module content...</p>
        </div>
      </div>
    );
  }

  if (getModuleQuery.error) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-4xl px-6 py-8">
          <p className="text-destructive text-center">Error loading module content</p>
        </div>
      </div>
    );
  }

  if (!getModuleQuery.data) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-4xl px-6 py-8">
          <p className="text-muted-foreground text-center">Module not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl px-6 py-8">
        <div className="prose prose-base dark:prose-invert max-w-none">
          <MarkdownRenderer>{getModuleQuery.data.content}</MarkdownRenderer>
        </div>
      </div>
    </div>
  );
}
