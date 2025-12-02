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
}

export default function FollowUpQuestions({
  questions = [
    "How to implement container and presentational components in React",
    "What are custom hooks and how do they improve code reuse",
    "When should higher order components be used in React",
    "How do render props enable reusable component logic",
    "What are the best practices to handle errors using error boundaries"
  ],
  isLoading = false
}: FollowUpQuestionsProps) {
  return (
    <div className="w-full mt-14">
      <h3 className="text-lg font-semibold mb-2">Follow-up Questions</h3>
      <Table>
        <TableBody>
          {isLoading ? (
            // Loading skeleton state
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow
                key={`skeleton-${index}`}
                className={cn(index === 0 && "border-t")}
              >
                <TableCell className="py-3 pl-4 pr-4">
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
              >
                <TableCell className="py-3 pl-4 pr-4 text-base">
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
