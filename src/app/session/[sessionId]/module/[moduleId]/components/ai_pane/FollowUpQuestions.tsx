import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FollowUpQuestionsProps {
  questions?: string[];
  isLoading?: boolean;
  onQuestionClick?: (question: string) => void;
}

export default function FollowUpQuestions({
  questions = [],
  isLoading = false,
  onQuestionClick
}: FollowUpQuestionsProps) {
  // Show skeleton if loading OR if no questions yet
  const showSkeleton = isLoading || questions.length === 0;

  return (
    <div className="w-full mt-14">
      <h3 className="text-lg font-semibold mb-2">Follow-up Questions</h3>
      <Table>
        <TableBody>
          {showSkeleton ? (
            // Loading skeleton state
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow
                key={`skeleton-${index}`}
                className={cn(index === 0 && "border-t")}
              >
                <TableCell className="py-3">
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : (
            // Actual questions
            questions.map((question, index) => (
              <TableRow
                key={index}
                className={cn(
                  "cursor-pointer hover:bg-muted/50 transition-colors",
                  index === 0 && "border-t"
                )}
                onClick={() => onQuestionClick?.(question)}
              >
                <TableCell className="py-3 text-base pl-0">
                  {question}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
