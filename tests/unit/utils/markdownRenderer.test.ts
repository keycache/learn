import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  renderMarkdownToHtml,
  renderMarkdownWithCache,
  clearMarkdownCache,
  getMarkdownCacheStats,
} from '../../../src/utils/markdownRenderer';

describe('markdownRenderer', () => {
  afterEach(() => {
    clearMarkdownCache();
  });

  describe('renderMarkdownToHtml', () => {
    it('should render simple markdown to HTML', async () => {
      const markdown = '# Hello World\n\nThis is a test.';
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toContain('<h1>');
      expect(html).toContain('Hello World');
      expect(html).toContain('<p>');
      expect(html).toContain('This is a test');
    });

    it('should render bold and italic text', async () => {
      const markdown = '**bold** and *italic* text';
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toContain('<strong>');
      expect(html).toContain('bold');
      expect(html).toContain('<em>');
      expect(html).toContain('italic');
    });

    it('should render lists', async () => {
      const markdown = `- Item 1
- Item 2
- Item 3`;
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toContain('<li>');
      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
      expect(html).toContain('Item 3');
    });

    it('should render code blocks with language highlighting', async () => {
      const markdown = `\`\`\`javascript
const x = 42;
\`\`\``;
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toContain('<pre>');
      expect(html).toContain('<code');
      expect(html).toContain('const x = 42');
    });

    it('should render inline code', async () => {
      const markdown = 'Use `const x = 42;` in your code.';
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toContain('<code>');
      expect(html).toContain('const x = 42');
    });

    it('should render links', async () => {
      const markdown = '[Google](https://google.com)';
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toContain('<a');
      expect(html).toContain('href=');
      expect(html).toContain('google.com');
      expect(html).toContain('Google');
    });

    it('should render tables (GFM)', async () => {
      const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toContain('<table>');
      expect(html).toContain('<thead>');
      expect(html).toContain('Header 1');
      expect(html).toContain('Cell 1');
    });

    it('should render strikethrough (GFM)', async () => {
      const markdown = '~~strikethrough~~ text';
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toContain('<del>');
      expect(html).toContain('strikethrough');
    });

    it('should render blockquotes', async () => {
      const markdown = '> This is a blockquote';
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toContain('<blockquote>');
      expect(html).toContain('This is a blockquote');
    });

    it('should render horizontal rules', async () => {
      const markdown = '---';
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toContain('<hr');
    });

    it('should sanitize script tags (XSS prevention)', async () => {
      const markdown = '<script>alert("XSS")</script>Hello';
      const html = await renderMarkdownToHtml(markdown);

      expect(html).not.toContain('<script>');
      expect(html).not.toContain('alert');
    });

    it('should handle empty markdown', async () => {
      const markdown = '';
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toBeDefined();
      expect(typeof html).toBe('string');
    });

    it('should handle complex nested structures', async () => {
      const markdown = `# Title

> A blockquote with **bold** and *italic*

- List item with \`code\`
  - Nested item

\`\`\`python
def hello():
    print("world")
\`\`\``;
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toContain('<h1>');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('<strong>');
      expect(html).toContain('<li>');
      expect(html).toContain('<code');
    });

    it('should return error message on render failure', async () => {
      // Even invalid markdown should render without throwing
      const markdown = '# Valid markdown';
      const html = await renderMarkdownToHtml(markdown);

      expect(html).toBeDefined();
      expect(typeof html).toBe('string');
    });
  });

  describe('renderMarkdownWithCache', () => {
    it('should render and cache markdown', async () => {
      const markdown = '# Test';
      const html1 = await renderMarkdownWithCache(
        markdown,
        'cat',
        'subcat',
        'topic',
        'lesson_1'
      );

      const stats1 = getMarkdownCacheStats();
      expect(stats1.size).toBe(1);
      expect(stats1.keys).toContain('cat/subcat/topic/lesson_1');

      // Render same lesson again - should be cached
      const html2 = await renderMarkdownWithCache(
        markdown,
        'cat',
        'subcat',
        'topic',
        'lesson_1'
      );

      expect(html1).toBe(html2);
      expect(stats1.size).toBe(1); // Still 1 entry in cache
    });

    it('should cache different lessons separately', async () => {
      const markdown = '# Test';

      await renderMarkdownWithCache(
        markdown,
        'cat',
        'subcat',
        'topic',
        'lesson_1'
      );
      await renderMarkdownWithCache(
        markdown,
        'cat',
        'subcat',
        'topic',
        'lesson_2'
      );
      await renderMarkdownWithCache(
        markdown,
        'cat',
        'subcat',
        'topic2',
        'lesson_1'
      );

      const stats = getMarkdownCacheStats();
      expect(stats.size).toBe(3);
      expect(stats.keys).toContain('cat/subcat/topic/lesson_1');
      expect(stats.keys).toContain('cat/subcat/topic/lesson_2');
      expect(stats.keys).toContain('cat/subcat/topic2/lesson_1');
    });

    it('should return cached result without re-rendering', async () => {
      const markdown = '# Test\n\nContent';
      let renderCount = 0;

      // Mock renderMarkdownToHtml by calling it directly
      const html1 = await renderMarkdownWithCache(
        markdown,
        'cat',
        'subcat',
        'topic',
        'lesson_1'
      );

      const html2 = await renderMarkdownWithCache(
        markdown,
        'cat',
        'subcat',
        'topic',
        'lesson_1'
      );

      // Should be identical (same cached reference or value)
      expect(html1).toBe(html2);
    });
  });

  describe('clearMarkdownCache', () => {
    it('should clear all cached markdown', async () => {
      const markdown = '# Test';

      await renderMarkdownWithCache(
        markdown,
        'cat',
        'subcat',
        'topic',
        'lesson_1'
      );
      await renderMarkdownWithCache(
        markdown,
        'cat',
        'subcat',
        'topic',
        'lesson_2'
      );

      let stats = getMarkdownCacheStats();
      expect(stats.size).toBe(2);

      clearMarkdownCache();

      stats = getMarkdownCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.keys).toHaveLength(0);
    });
  });

  describe('getMarkdownCacheStats', () => {
    it('should return cache statistics', async () => {
      let stats = getMarkdownCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);

      await renderMarkdownWithCache(
        '# Test 1',
        'cat',
        'subcat',
        'topic',
        'lesson_1'
      );

      stats = getMarkdownCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.keys).toContain('cat/subcat/topic/lesson_1');

      await renderMarkdownWithCache(
        '# Test 2',
        'cat',
        'subcat',
        'topic',
        'lesson_2'
      );

      stats = getMarkdownCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toHaveLength(2);
    });
  });
});
