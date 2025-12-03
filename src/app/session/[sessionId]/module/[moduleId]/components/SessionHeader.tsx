"use client";

import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useGetModule, useMarkModuleComplete } from "../hooks";

interface SessionHeaderProps {
  sessionId: string;
  moduleId: string;
}

export function SessionHeader({ sessionId, moduleId }: SessionHeaderProps) {
  const router = useRouter();

  // Fetch module data
  const getModuleQuery = useGetModule(moduleId);

  // Mark module complete mutation
  const markModuleCompleteMutation = useMarkModuleComplete();

  // Extract module and session names from fetched data
  const sessionName = getModuleQuery.data?.learningSession?.name || "Loading...";
  const moduleOrder = getModuleQuery.data?.order;
  const moduleName = moduleOrder !== undefined
    ? `${moduleOrder + 1}. ${getModuleQuery.data?.name || "Loading..."}`
    : getModuleQuery.data?.name || "Loading...";

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
        <div className="pt-8 pb-8 flex items-center justify-between">
          <div className="flex flex-col items-start gap-2">
            {getModuleQuery.isLoading ? (
              <>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-64" />
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{sessionName}</p>
                <h1 className="text-2xl font-semibold">{moduleName}</h1>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/session/${sessionId}`}>
              <Button variant="outline" size="default" className="rounded-lg">
                <ArrowLeft className="h-4 w-4" />
                Course
              </Button>
            </Link>
            <Button
              size="default"
              className="rounded-lg"
              onClick={handleComplete}
              disabled={markModuleCompleteMutation.isPending}
            >
              {markModuleCompleteMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {markModuleCompleteMutation.isPending ? "Completing..." : "Complete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
