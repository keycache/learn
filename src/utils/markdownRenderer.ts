import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

/**
 * Cache for rendered markdown HTML
 * Stores category/subcategory/topic/lessonId -> rendered HTML
 */
const markdownCache = new Map<string, string>();

/**
 * Generate cache key for markdown HTML
 */
function getMarkdownCacheKey(
  categoryId: string,
  subcategoryId: string,
  topicId: string,
  lessonId: string
): string {
  return `${categoryId}/${subcategoryId}/${topicId}/${lessonId}`;
}

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes script tags and event handlers
 */
function sanitizeHtml(html: string): string {
  // Remove script tags and content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data URIs that could contain scripts
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  return sanitized;
}

/**
 * Render markdown to sanitized HTML
 * Supports GitHub-flavored markdown with proper XSS prevention
 *
 * @param markdownContent Raw markdown text
 * @returns Sanitized HTML string
 */
export async function renderMarkdownToHtml(
  markdownContent: string
): Promise<string> {
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm) // GitHub flavored markdown
      .use(remarkHtml);

    const html = await processor.process(markdownContent);
    const htmlString = String(html);

    // Sanitize the output
    return sanitizeHtml(htmlString);
  } catch (error) {
    console.error('Error rendering markdown:', error);
    // Return error message as fallback
    return `<div class="text-red-500 dark:text-red-400"><p>Error rendering markdown content</p></div>`;
  }
}

/**
 * Render markdown with caching
 * Stores rendered HTML to avoid re-rendering same lesson
 *
 * @param markdownContent Raw markdown text
 * @param categoryId Category ID (for cache key)
 * @param subcategoryId Subcategory ID (for cache key)
 * @param topicId Topic ID (for cache key)
 * @param lessonId Lesson ID (for cache key)
 * @returns Cached or freshly rendered HTML
 */
export async function renderMarkdownWithCache(
  markdownContent: string,
  categoryId: string,
  subcategoryId: string,
  topicId: string,
  lessonId: string
): Promise<string> {
  const cacheKey = getMarkdownCacheKey(
    categoryId,
    subcategoryId,
    topicId,
    lessonId
  );

  // Check cache first
  if (markdownCache.has(cacheKey)) {
    return markdownCache.get(cacheKey)!;
  }

  // Render and cache
  const html = await renderMarkdownToHtml(markdownContent);
  markdownCache.set(cacheKey, html);

  return html;
}

/**
 * Clear the markdown rendering cache
 * Useful for testing or when markdown needs to be re-rendered
 */
export function clearMarkdownCache(): void {
  markdownCache.clear();
}

/**
 * Get cache statistics (for debugging)
 */
export function getMarkdownCacheStats(): { size: number; keys: string[] } {
  return {
    size: markdownCache.size,
    keys: Array.from(markdownCache.keys()),
  };
}
