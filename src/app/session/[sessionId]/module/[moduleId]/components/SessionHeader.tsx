"use client";

import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetModule } from "../hooks";

interface SessionHeaderProps {
  sessionId: string;
  moduleId: string;
}

export function SessionHeader({ sessionId, moduleId }: SessionHeaderProps) {
  // Fetch module data
  const getModuleQuery = useGetModule(moduleId);

  // Extract module and session names from fetched data
  const sessionName = getModuleQuery.data?.learningSession?.name || "Loading...";
  const moduleName = getModuleQuery.data?.name || "Loading...";

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
            <Button size="default" className="rounded-lg">
              <Check className="h-4 w-4" />
              Complete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
