"use client";

import { ArrowLeft, Bot, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetModule, useMarkModuleComplete } from "../hooks";

interface ModuleHeaderProps {
  sessionId: string;
  moduleId: string;
  isPaneOpen: boolean;
  onTogglePane: () => void;
}

export function ModuleHeader({ sessionId, moduleId, isPaneOpen, onTogglePane }: ModuleHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id || "";

  // Fetch module data
  const getModuleQuery = useGetModule(moduleId, userId);

  // Mark module complete mutation
  const markModuleCompleteMutation = useMarkModuleComplete(userId);

  // Extract module and session names from fetched data
  const sessionName = getModuleQuery.data?.learningSession?.name || "";
  const moduleOrder = getModuleQuery.data?.order;
  const moduleName = moduleOrder !== undefined
    ? `${moduleOrder + 1}. ${getModuleQuery.data?.name || ""}`
    : getModuleQuery.data?.name || "";
  const isModuleComplete = getModuleQuery.data?.isComplete || false;

  // Handle complete button click
  const handleComplete = async () => {
    try {
      await markModuleCompleteMutation.mutateAsync(moduleId);
      // Navigate back to session page
      router.push(`/session/${sessionId}`);
    } catch (error) {
      console.error("Failed to mark module as complete:", error);
    }
  };

  return (
    <div className="bg-background flex justify-center border-b">
      <div className="w-full max-w-4xl px-6">
        <div className="pt-4 pb-4 flex items-center justify-between gap-4">
          <div className="flex flex-col items-start">
            {!sessionName || !moduleName ? (
              <div className="flex flex-col gap-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-7 w-64" />
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{sessionName}</p>
                <h1 className="text-2xl font-semibold">{moduleName}</h1>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => router.push(`/session/${sessionId}`)} variant="outline" size="icon" className="rounded-lg hover:bg-secondary hover:text-secondary-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                <p>Back to Course</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleComplete} disabled={markModuleCompleteMutation.isPending || isModuleComplete} variant="outline" size="icon" className="rounded-lg hover:bg-secondary hover:text-secondary-foreground">
                  {markModuleCompleteMutation.isPending ? <Spinner className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                <p>Complete Module</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onTogglePane} variant="outline" size="icon" className="rounded-lg hover:bg-secondary hover:text-secondary-foreground">
                  <Bot className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                <p>AI Tutor</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
