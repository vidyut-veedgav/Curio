import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SessionHeaderProps {
  sessionName: string;
  sessionId: string;
  completedModules: number;
  totalModules: number;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function SessionHeader({
  sessionName,
  sessionId,
  completedModules,
  totalModules,
  onDelete,
  isDeleting = false,
}: SessionHeaderProps) {
  const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="mb-8">
      {/* Back Button and Delete Button */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/home" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent hover:outline hover:outline-2 hover:outline-destructive transition-all"
              disabled={isDeleting}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the session &quot;{sessionName}&quot; and all of its modules. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:bg-secondary hover:text-secondary-foreground" disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Spinner className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Header with Title */}
      <h1 className="text-4xl font-bold mb-4">{sessionName}</h1>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{completedModules} of {totalModules} modules completed</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-right text-sm font-semibold text-primary mt-1">
          {progressPercentage}%
        </div>
      </div>
    </div>
  );
}
