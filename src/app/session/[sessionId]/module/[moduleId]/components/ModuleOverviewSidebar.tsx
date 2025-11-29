"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import MarkdownRenderer from '@/app/MarkdownRenderer';
import { memo } from 'react';

interface ModuleOverviewSidebarProps {
  moduleName: string;
  overview: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function ModuleOverviewSidebarComponent({
  moduleName,
  overview,
  isCollapsed,
  onToggleCollapse,
}: ModuleOverviewSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`
          hidden lg:block
          relative
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-12' : 'w-full lg:max-w-[500px]'}
        `}
      >
        {/* Toggle Button */}
        <Button
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand module overview" : "Collapse module overview"}
          aria-expanded={!isCollapsed}
          variant="ghost"
          size="icon"
          className={`
            absolute top-4 z-10 rounded-full hover:bg-accent/10
            ${isCollapsed ? 'left-0' : 'right-4'}
          `}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {/* Sidebar Content */}
        {!isCollapsed && (
          <Card className="border-l-4 border-l-accent bg-card shadow-md rounded-lg sticky top-24 max-h-[calc(100vh-12rem)] overflow-hidden">
            <CardHeader className="sticky top-0 bg-card z-10 border-b">
              <CardTitle className="text-xl pr-8">{moduleName}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="pr-4">
                  <MarkdownRenderer>{overview}</MarkdownRenderer>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Stacked Version */}
      <div className="lg:hidden mb-4">
        <Card className="border-b-2 border-b-accent bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">{moduleName}</CardTitle>
            <Button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Expand module overview" : "Collapse module overview"}
              aria-expanded={!isCollapsed}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-accent/10 shrink-0"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4 rotate-90" />}
            </Button>
          </CardHeader>
          <div
            className={`
              overflow-hidden
              transition-all duration-300 ease-in-out
              ${isCollapsed ? 'max-h-0' : 'max-h-96'}
            `}
          >
            <CardContent className="pb-4">
              <ScrollArea className="max-h-80">
                <div className="pr-4">
                  <MarkdownRenderer>{overview}</MarkdownRenderer>
                </div>
              </ScrollArea>
            </CardContent>
          </div>
        </Card>
      </div>
    </>
  );
}

// Memoize to prevent unnecessary re-renders when chat messages update
export const ModuleOverviewSidebar = memo(ModuleOverviewSidebarComponent);
