"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            
            return !inline && language ? (
              <SyntaxHighlighter
                style={isDark ? oneDark : oneLight}
                language={language}
                PreTag="div"
                className="rounded-md not-prose"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className={cn(
                  "bg-muted px-1 py-0.5 rounded text-sm font-mono",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 italic my-4 bg-muted/50 p-4 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-border">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-border px-4 py-2">
                {children}
              </td>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-xl font-semibold mt-5 mb-3 text-foreground">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-base font-medium mt-3 mb-2 text-foreground">
                {children}
              </h4>
            );
          },
          h5({ children }) {
            return (
              <h5 className="text-sm font-medium mt-2 mb-1 text-foreground">
                {children}
              </h5>
            );
          },
          h6({ children }) {
            return (
              <h6 className="text-sm font-medium mt-2 mb-1 text-muted-foreground">
                {children}
              </h6>
            );
          },
          p({ children }) {
            return (
              <p className="mb-4 leading-relaxed text-foreground">
                {children}
              </p>
            );
          },
          ul({ children }) {
            return (
              <ul className="mb-4 ml-6 space-y-1 list-disc">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="mb-4 ml-6 space-y-1 list-decimal">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return (
              <li className="text-foreground">
                {children}
              </li>
            );
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                className="text-primary hover:text-primary/80 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          strong({ children }) {
            return (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            );
          },
          em({ children }) {
            return (
              <em className="italic text-foreground">
                {children}
              </em>
            );
          },
          hr() {
            return (
              <hr className="my-6 border-border" />
            );
          },
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-lg my-4 border border-border"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}