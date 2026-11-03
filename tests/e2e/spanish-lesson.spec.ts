import { test, expect } from '@playwright/test';

test.describe('Spanish Numbers Lesson', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173/learn/');
  });

  test('should load Spanish > Numbers topic with lesson content', async ({ page }) => {
    // Navigate to Spanish
    await page.click('a:has-text("Spanish")');
    await page.waitForURL(/spanish/);
    
    // Navigate to Numbers
    await page.click('a:has-text("Numbers")');
    await page.waitForURL(/numbers/);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a moment and check for any error messages on page
    await page.waitForTimeout(1000);
    
    const errorElements = await page.locator('[role="alert"], .text-red-600, .error').allTextContents();
    console.log('Page errors:', errorElements);
    console.log('Console errors:', errors);
    
    // Check that lesson is displayed
    const lessonTitle = await page.locator('h1').first().textContent();
    console.log('Lesson title:', lessonTitle);
    expect(lessonTitle).toContain('Spanish Numbers');
    
    // Check for lesson content - should have markdown content
    const lessonContent = await page.locator('text=Learning Objectives').isVisible();
    console.log('Learning Objectives visible:', lessonContent);
    
    // Check lesson content section
    const content = await page.locator('h2:has-text("Lesson Content")').isVisible();
    console.log('Lesson Content section visible:', content);
    
    // The real test - check if markdown content is rendered
    // This should show actual lesson markdown, not just metadata
    const lessonBody = await page.locator('[data-testid="markdown-renderer"], .prose, .markdown').first().innerText();
    console.log('Lesson body preview (first 200 chars):', lessonBody?.substring(0, 200));
    
    // If we get here, basic page loaded
    expect(lessonTitle).toBeTruthy();
    
    // Check that quiz tab is NOT showing if there's no quiz
    const quizTab = await page.locator('button:has-text("Quiz")').isHidden();
    console.log('Quiz tab hidden (should be true for lessons-only):', quizTab);
  });

  test('should fetch and display lesson_1.md content', async ({ page }) => {
    // Direct test of fetch
    const response = await page.evaluate(async () => {
      const path = '/learn/data/categories/spoken-languages/spanish/numbers/lesson_1.md';
      const res = await fetch(path);
      const text = await res.text();
      return {
        status: res.status,
        contentLength: text.length,
        hasYAML: text.includes('---'),
        preview: text.substring(0, 500),
      };
    });
    
    console.log('Fetch test results:', response);
    expect(response.status).toBe(200);
    expect(response.contentLength).toBeGreaterThan(1000);
    expect(response.hasYAML).toBe(true);
  });

  test('should load lesson through API', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Simulate what loadLessonContent does
      const basePath = '/learn/';
      const lessonPath = `${basePath}data/categories/spoken-languages/spanish/numbers/lesson_1.md`;
      
      try {
        const response = await fetch(lessonPath);
        if (!response.ok) {
          return { error: `HTTP ${response.status}` };
        }
        
        const content = await response.text();
        
        // Parse frontmatter
        const frontmatterRegex = /^---\r?\n([\s\S]*?)\n---\r?\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        
        if (!match) {
          return { error: 'No frontmatter found' };
        }
        
        const [, frontmatterStr, markdownContent] = match;
        
        return {
          success: true,
          frontmatterLength: frontmatterStr.length,
          contentLength: markdownContent.trim().length,
          contentPreview: markdownContent.trim().substring(0, 300),
        };
      } catch (error) {
        return { error: String(error) };
      }
    });
    
    console.log('Lesson load result:', result);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.contentLength).toBeGreaterThan(500);
    }
  });
});
