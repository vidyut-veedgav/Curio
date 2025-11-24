"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const chatMessageVariants = cva(
  "break-words",
  {
    variants: {
      variant: {
        user: "bg-muted rounded-2xl px-4 py-3 inline-block",
        ai: "w-full",
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
  role: "user" | "assistant";
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ className, variant, content, role, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className="flex w-full justify-start"
        {...props}
      >
        <div
          className={cn(
            chatMessageVariants({ variant: role === "user" ? "user" : "ai" }),
            className
          )}
        >
          <div className="text-base leading-relaxed prose prose-sm max-w-none dark:prose-invert [&_.katex]:text-inherit [&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }
);
ChatMessage.displayName = "ChatMessage";

export { ChatMessage, chatMessageVariants };
