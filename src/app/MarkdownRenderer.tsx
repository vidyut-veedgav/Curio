'use client';

import React, { useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  children: string;
}

export default function MarkdownRenderer({ children }: MarkdownRendererProps) {
  // 1. Pre-process the content to replace AI delimiters with library delimiters
  // We use useMemo so this only runs when the content actually changes
  const processedContent = useMemo(() => {
    if (!children) return "";
    
    return children
      // Replace block math \[ ... \] with $$ ... $$
      .replace(/\\\[/g, '$$$$') 
      .replace(/\\\]/g, '$$$$')
      // Replace inline math \( ... \) with $ ... $
      .replace(/\\\(/g, '$$') 
      .replace(/\\\)/g, '$$');
  }, [children]);

  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        code(props) {
          const { inline, className, children: codeChildren, ...rest } = props as {
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
          };
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <SyntaxHighlighter
              style={dracula as { [key: string]: React.CSSProperties }}
              PreTag="div"
              language={match[1]}
            >
              {String(codeChildren).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...rest}>
              {codeChildren}
            </code>
          );
        },
        p(props) {
          const { children: pChildren, ...rest } = props;
          return <p {...rest}>{pChildren}</p>;
        },
      }}
    >
      {processedContent}
    </Markdown>
  );
}