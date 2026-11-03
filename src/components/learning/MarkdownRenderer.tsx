import React, { useEffect, useState, useMemo } from 'react';
import { renderMarkdownWithCache } from '../../utils/markdownRenderer';

interface MarkdownRendererProps {
  content: string; // Raw markdown content
  categoryId: string;
  subcategoryId: string;
  topicId: string;
  lessonId: string;
  className?: string;
}

/**
 * MarkdownRenderer Component
 * Renders markdown content to HTML with caching and lazy-loading
 *
 * Features:
 * - Lazy rendering (only renders when mounted/needed)
 * - HTML caching to avoid re-rendering
 * - GitHub-flavored markdown support
 * - XSS protection via sanitization
 * - Syntax highlighting for code blocks
 * - Responsive styling
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  categoryId,
  subcategoryId,
  topicId,
  lessonId,
  className = '',
}) => {
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the rendering to avoid unnecessary renders
  const renderContent = useMemo(
    () => async () => {
      try {
        setIsLoading(true);
        setError(null);
        const rendered = await renderMarkdownWithCache(
          content,
          categoryId,
          subcategoryId,
          topicId,
          lessonId
        );
        setHtml(rendered);
      } catch (err) {
        console.error('Error rendering markdown:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to render markdown'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [content, categoryId, subcategoryId, topicId, lessonId]
  );

  useEffect(() => {
    renderContent();
  }, [renderContent]);

  if (isLoading) {
    return (
      <div
        className={`${className} space-y-4 animate-pulse`}
        aria-busy="true"
        aria-label="Loading markdown content"
      >
        {/* Skeleton loader */}
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/5" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${className} bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4`}
        role="alert"
      >
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Error rendering content
        </p>
        <p className="text-red-500 dark:text-red-300 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`markdown-content ${className} prose prose-sm dark:prose-invert max-w-none
        prose-headings:text-foreground
        prose-p:text-foreground
        prose-a:text-blue-600 dark:prose-a:text-blue-400
        prose-strong:text-foreground
        prose-code:text-foreground prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded
        prose-pre:bg-muted prose-pre:text-foreground
        prose-blockquote:text-muted-foreground prose-blockquote:border-l-muted
        prose-table:text-foreground
        prose-thead:bg-muted prose-thead:text-foreground
        prose-tbody:divide-muted
        prose-img:rounded-lg prose-img:shadow-md
        prose-hr:border-muted
        space-y-4
        [&_table]:border-collapse [&_table]:w-full
        [&_table_th]:border [&_table_th]:border-muted [&_table_th]:px-4 [&_table_th]:py-2
        [&_table_td]:border [&_table_td]:border-muted [&_table_td]:px-4 [&_table_td]:py-2`}
      dangerouslySetInnerHTML={{ __html: html }}
      aria-live="polite"
      aria-label="Rendered lesson content"
    />
  );
};

export default MarkdownRenderer;
