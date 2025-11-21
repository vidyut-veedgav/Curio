import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chatMessageVariants = cva(
  "rounded-2xl px-4 py-3 max-w-[85%] break-words",
  {
    variants: {
      variant: {
        user: "bg-muted ml-auto",
        ai: "bg-background border border-border",
      },
    },
    defaultVariants: {
      variant: "ai",
    },
  }
);

export interface ChatMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatMessageVariants> {
  content: string;
  author: "User" | "AI";
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ className, variant, content, author, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full",
          author === "User" ? "justify-end" : "justify-start"
        )}
        {...props}
      >
        <div
          className={cn(
            chatMessageVariants({ variant: author === "User" ? "user" : "ai" }),
            className
          )}
        >
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    );
  }
);
ChatMessage.displayName = "ChatMessage";

export { ChatMessage, chatMessageVariants };
