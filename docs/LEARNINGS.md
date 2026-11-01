# Dark Mode Implementation - Learnings

## Problem

Dark mode toggle was not working. The icon would change (Moon ↔ Sun), localStorage was being updated correctly, and the `dark` class was being added/removed from the HTML element, **but the colors on the page remained unchanged**.

**Symptoms:**
- Page always displayed light theme colors regardless of toggle state
- Console logs confirmed:
  - Dark class was being added: `classList.contains("dark"): true` ✅
  - localStorage was being set: `localStorage.theme: dark` ✅
  - BUT computed styles showed light mode colors even when dark class was active
- Inverted behavior: removing dark class showed dark colors, adding it showed light colors

## Root Cause

The `App.tsx` component had inline styles that were **overriding the CSS rules** defined in `index.css`:

```tsx
// BEFORE - This was the problem:
<div className="min-h-screen bg-white dark:bg-slate-950 transition-colors" 
     style={{
       backgroundColor: 'white',
       color: 'rgb(17 24 39)',
     }}>
```

**Why this broke dark mode:**
- Inline styles have the highest CSS specificity (they override almost everything)
- Even though `index.css` defined:
  ```css
  html { background-color: white; color: rgb(17 24 39); }
  html.dark { background-color: rgb(3 7 18); color: rgb(241 245 250); }
  ```
- The App div's inline styles (`backgroundColor: 'white'`) were always applied to the rendered content
- The html element styles were being superseded by the more specific App div styles

## Solution

**Remove the wrapper div's inline style overrides** and let the html element handle styling:

```tsx
// AFTER - This works:
<>
  <header className="fixed top-0 right-0 p-4 z-50">
    <DarkModeToggle />
  </header>

  <div className="min-h-screen w-screen flex items-center justify-center">
    <h1 className="text-6xl font-bold">
      Hello Learning
    </h1>
  </div>
</>
```

**Key changes:**
1. Removed the outer wrapper div with inline styles
2. Used a React fragment `<>...</>` instead
3. Removed hardcoded `backgroundColor` and `color` inline styles
4. Now the html element styles from `index.css` apply correctly to the entire page

## Missteps & Debugging Journey

### Misstep 1: Assumed Tailwind 4 Media Query Issue ❌
Initially believed Tailwind 4 with the Vite plugin was generating `@media (prefers-color-scheme: dark)` instead of class-based selectors.

**What we did:**
- Added explicit RGB color values to index.css instead of Tailwind classes
- Added safelist to tailwind.config.ts
- Tried various CSS layer configurations

**Why this didn't help:**
- The CSS was actually correct - Tailwind was properly generating `html.dark { ... }` selectors
- The real issue was CSS specificity, not selector generation

### Misstep 2: Tested CSS in jsdom Test Environment ❌
Added comprehensive console logging and computed style checks to the tests, expecting to see CSS styling applied.

**What we did:**
- Created elaborate test cases checking `window.getComputedStyle()`
- Logged computed background colors and text colors in jsdom
- Expected CSS rules to be evaluated

**Why this didn't help:**
- jsdom (used by Vitest) doesn't actually render or apply CSS
- Computed styles always returned default/transparent values
- This was a false lead - the issue wasn't with CSS rendering

### Misstep 3: Over-instrumented Code with Console Logs ⚠️
Added excessive console logging to trace the problem:
- 10+ console.log statements in DarkModeToggle.tsx
- 15+ console.log statements in main.tsx
- CSS rule inspection code

**Why this was wasteful:**
- Made the code messy and hard to read
- Would have shipped to production (had to be cleaned up)
- The actual problem was obvious once you looked at the App component

### Misstep 4: Didn't Check Component Specificity Early ❌
Should have immediately asked: "What is actually rendering on the page?" and inspected the rendered HTML.

**What we should have done:**
- Checked the actual HTML structure and styles with DevTools
- Looked at the element tree to see what was applying styles
- Realized the App div's inline styles were winning

## Key Learning

**CSS Specificity Always Wins Over CSS Rules**

Inline styles (`style={{ ... }}`) have higher specificity than CSS selectors, even when the selectors are more specific. Never use inline styles for theme-related properties that you want CSS rules to override.

### Specificity Hierarchy (Low to High):
1. HTML element selectors: `html { }`
2. Class selectors: `.dark { }`, `html.dark { }`
3. Inline styles: `style={{ ... }}` ← **Highest!**

## Prevention for Future

- ✅ Always test theme/dark mode in a real browser, not just jsdom
- ✅ Avoid inline styles for theme-related properties (backgroundColor, color, etc.)
- ✅ Let the html element handle page-wide styling
- ✅ Use component-level styling only for component-specific overrides
- ✅ Check rendered HTML structure early when debugging styling issues

## Files Changed

- `src/App.tsx` - Removed wrapper div inline styles
- `src/index.css` - Kept CSS rules as-is (they were correct all along)
- `src/main.tsx` - Cleaned up console logs
- `src/components/DarkModeToggle.tsx` - Cleaned up console logs

---

# Phase 6: Lessons System - Debugging Journey

## Problem Statement

After implementing the complete lessons system (TypeScript types, data loaders, markdown rendering, UI components), the lessons were not displaying in the browser when navigating to a topic. The page still showed the old "Choose your difficulty level" UI instead of the new lesson tabs.

**Symptoms:**
- ❌ Subtitle "Learn and master this topic through lessons and practice quizzes" not showing
- ❌ Lesson tabs not rendering
- ❌ Difficulty selector still displayed (old UI)
- ✅ BUT: All 128 tests passing
- ✅ BUT: TypeScript compilation successful
- ✅ BUT: Build successful

The code was correct, but something prevented the lessons from being discovered at runtime.

## Debugging Timeline

### Stage 1: Cache vs. Code Issue (False Lead) ⏱️ 30 minutes

**Initial Hypothesis:** Browser cache is showing old code

**What we tried:**
- Browser hard refresh (Cmd+Shift+R)
- Disabled cache in DevTools
- Restarted dev server

**Result:** ❌ No change - lessons still not showing

**Learning:** While cache management is important, we should have immediately added console logging to determine if this was a runtime execution issue or a browser cache issue.

---

### Stage 2: Dynamic Import Path Issue 🎯 (Root Cause #1)

**Observation:** Console logs showed:
```
[discoverLessons] Breaking: checked 6 files with no results
[discoverLessons] Returning 0 lessons for numbers
```

Lessons were not being discovered despite files existing on disk.

**Root Cause:** Vite doesn't support fully dynamic imports with variable paths:
```javascript
// ❌ This doesn't work - Vite can't resolve the path at build time
const lessonContent = await import(
  `../data/categories/${categoryId}/${subcategoryId}/${topicId}/${lessonId}.md?raw`
);
```

**Why it failed silently:**
- Dynamic imports require Vite to analyze the pattern at build time
- With a fully variable path, Vite can't determine what to bundle
- The import fails, exception is caught, and code continues (silently)

**Solution:** Use `fetch()` instead:
```javascript
// ✅ This works - fetch can handle dynamic paths at runtime
const basePath = import.meta.env.BASE_URL || '/learn/';
const lessonPath = `${basePath}data/categories/${categoryId}/${subcategoryId}/${topicId}/${lessonId}.md`;
const response = await fetch(lessonPath);
const content = await response.text();
```

**Key insight:** Different module resolution strategies are needed:
- **Static paths:** Use ES6 `import()` for Vite bundling
- **Dynamic paths:** Use `fetch()` for runtime flexibility
- **Mix of both:** Need to choose based on your use case

---

### Stage 3: Static Asset Location Issue 🎯 (Root Cause #2)

**Observation:** After switching to `fetch()`, console showed:
```
GET http://localhost:5173/data/... [HTTP/1.1 404 Not Found]
```

Files existed on disk but weren't being served by the dev server.

**Root Cause:** Vite serves files from the `public/` folder as static assets
- Lesson files were in `src/data/categories/...` (not served)
- Needed to move them to `public/data/categories/...`

**Why this matters:**
- `src/` files are bundled by Vite (used via ES6 imports only)
- `public/` files are served as-is by the dev server (accessible via HTTP)

**Solution:**
```bash
# Move files to public directory
mkdir -p public/data/categories/spoken-languages/french/numbers
cp src/data/categories/spoken-languages/french/numbers/lesson_*.md \
   public/data/categories/spoken-languages/french/numbers/
```

**Key insight:** Understanding your build tool's directory structure is crucial:
- ES6 imports: Use bundled sources (src/)
- HTTP fetch: Use static assets (public/)

---

### Stage 4: Vite Base Path Issue 🎯 (Root Cause #3)

**Observation:** Files still 404 after moving to `public/`

**Problem:** Initial fetch path was `/data/categories/...` but should have been `/learn/data/categories/...`

**Root Cause:** `vite.config.ts` has `base: '/learn/'`
```typescript
export default defineConfig({
  base: '/learn/',  // ← This affects all asset paths
  // ...
})
```

All assets are served under the base path, not at root.

**Solution:** Use `import.meta.env.BASE_URL`:
```javascript
const basePath = import.meta.env.BASE_URL || '/learn/';
const lessonPath = `${basePath}data/categories/...`;
```

**Key insight:** Always respect the Vite base configuration. It applies to:
- Static assets in public/
- Image imports
- Font files
- Any HTTP requests for assets

---

### Stage 5: Frontmatter Parser Issues 🎯 (Root Cause #4)

**Observation:** Files were fetched successfully (200 OK) but parsing failed:
```
Error: Invalid markdown format: missing frontmatter delimiters (---)
Error: Invalid frontmatter: tags must be an array
```

**Root Causes:**

**#5a: Regex didn't handle `\r\n` line endings**
```javascript
// ❌ Only matches \n (Unix)
const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;

// ✅ Handles both \n and \r\n
const frontmatterRegex = /^---\r?\n([\s\S]*?)\n---\r?\n([\s\S]*)$/;
```

**#5b: Parser didn't handle JSON-style inline arrays**

Lesson YAML had:
```yaml
tags: ["beginner", "numbers", "pronunciation"]
learningObjectives: ["Pronounce...", "Recognize...", "Practice..."]
```

But parser only supported:
```yaml
tags:
  - beginner
  - numbers
```

**Solution:** Added JSON.parse() support:
```javascript
function parseYAMLValue(value: string): unknown {
  // Handle JSON-style arrays: ["item1", "item2"]
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(`Invalid JSON array: ${value}`);
    }
  }
  // ... rest of parsing
}
```

**Key insights:**
- Test with actual data (Windows vs. Unix line endings matter)
- Support multiple YAML formats for flexibility
- Combine YAML and JSON parsing for mixed formats

---

### Stage 6: Unnecessary API Calls Issue ⚠️

**Observation:** Console showed 404 errors for lesson_18, lesson_19, lesson_20, etc.

**Problem:** Lesson discovery tried all 20 possible files
- Only 3 lessons exist
- But loop tried files 1-20
- Each missing file = HTTP 404 error

**Solution:** Stop after 3 consecutive missing files:
```javascript
let consecutiveMissing = 0;

for (let i = 1; i <= 20; i++) {
  try {
    const response = await fetch(lessonPath);
    if (!response.ok) {
      consecutiveMissing++;
      if (consecutiveMissing >= 3) break; // Stop early
      continue;
    }
    consecutiveMissing = 0; // Reset on success
    // ... process file
  } catch (e) {
    consecutiveMissing++;
    if (consecutiveMissing >= 3) break;
  }
}
```

**Key insight:** Optimize discovery loops to fail fast, especially with I/O operations.

---

## How This Could Have Been Planned For

### 1. **Architecture Decision: Static Asset Strategy**

**Pre-decision checklist:**
- [ ] Where should markdown files live? (src/ vs public/)
- [ ] Will they be imported (ES6) or fetched (HTTP)?
- [ ] What's the Vite build config base path?
- [ ] Will files be organized by topic? (affects path variables)

**Recommended approach:**
```
PLAN: "Lesson files will be fetched at runtime from public/"
REASON: 
  - Allows dynamic lesson discovery
  - No build-time coupling to topic/lesson structure
  - Easier to add/remove lessons without rebuilding
IMPLICATION:
  - Must use fetch() not import()
  - Must respect BASE_URL in config
  - Must set up correct directory structure early
```

### 2. **Data Format Specification**

**Pre-implementation checklist:**
- [ ] Document YAML format with examples
- [ ] Specify which YAML syntax is supported (inline arrays, multi-line, etc.)
- [ ] Include Windows (\r\n) and Unix (\n) line endings in test cases
- [ ] Version the format in case it needs to evolve

**Recommended approach:**
```markdown
## Lesson YAML Format (v1.0)

Must include exactly these 7 fields:
- title: "Lesson Name" (string, required)
- summary: "Brief description" (string, required)
- duration: "8-12 minutes" (string, required)
- active: true (boolean, required)
- difficulty: "beginner|intermediate|advanced" (enum, required)
- learningObjectives: [array of strings, required]
- tags: ["tag1", "tag2"] (JSON array format, required)

Example:
---
title: "Introduction to French Numbers (0-10)"
summary: "Master the foundational French numbers..."
duration: "8-12 minutes"
active: true
difficulty: "beginner"
learningObjectives:
  - "Pronounce numbers 0-10 correctly"
  - "Recognize written numerals"
tags: ["beginner", "numbers", "pronunciation"]
---
```

### 3. **Integration Test Early**

**Pre-launch testing checklist:**
- [ ] Test lesson discovery with actual .md files (not mocks)
- [ ] Test with Windows line endings (\r\n)
- [ ] Test with missing/optional lesson files
- [ ] Test with invalid YAML in lesson files
- [ ] Test with varying topic/category/subcategory directory depth

**Recommended approach:**
```typescript
describe('Lesson Integration', () => {
  it('discovers 3 French number lessons', async () => {
    const lessons = await discoverLessons(
      'spoken-languages',
      'french',
      'numbers'
    );
    expect(lessons).toHaveLength(3);
    expect(lessons[0].id).toBe('lesson_1');
  });

  it('handles missing lesson files gracefully', async () => {
    const lessons = await discoverLessons(
      'spoken-languages',
      'french',
      'nonexistent'
    );
    expect(lessons).toHaveLength(0); // No error, just empty
  });

  it('parses lesson metadata correctly', async () => {
    const lessons = await discoverLessons(...);
    expect(lessons[0]).toHaveProperty('title');
    expect(lessons[0]).toHaveProperty('learningObjectives');
    expect(Array.isArray(lessons[0].learningObjectives)).toBe(true);
  });
});
```

### 4. **Configuration Documentation**

**Pre-launch checklist:**
- [ ] Document `vite.config.ts` base path requirement
- [ ] Document directory structure requirements
- [ ] Document how to add new topics/lessons
- [ ] Document troubleshooting (e.g., "lessons not showing")

**Recommended approach in IMPLEMENTATION.md:**
```markdown
## File Structure & Configuration

### Directory Layout
```
public/data/categories/
├── category-id/
│   └── subcategory-id/
│       ├── metadata.json        (category/subcategory info)
│       └── topic-id/
│           ├── quiz.json        (quiz data)
│           ├── lesson_1.md      (lesson 1 content + frontmatter)
│           ├── lesson_2.md      (lesson 2 content + frontmatter)
│           └── ...
```

### Important: Vite Base Path
The `vite.config.ts` has `base: '/learn/'`.
This means:
- Lesson files are served at: `/learn/data/categories/...`
- NOT at: `/data/categories/...`
- Code uses: `import.meta.env.BASE_URL` to handle this automatically
```

### 5. **Console Logging Strategy**

**Pre-implementation checklist:**
- [ ] Where will debugging happen? (browser DevTools, tests, logs?)
- [ ] What levels of verbosity? (error, warn, info, debug)
- [ ] Will logging be removed before shipping?
- [ ] Consider using a logger with levels vs. raw console.log

**Recommended approach:**
```typescript
// Use a minimal logger with clear prefixes
const log = {
  error: (msg: string, err?: Error) => console.error(`[LESSON] ${msg}`, err),
  warn: (msg: string) => console.warn(`[LESSON] ${msg}`),
  info: (msg: string) => console.info(`[LESSON] ${msg}`),
  // debug only in development
  debug: (msg: string) => process.env.NODE_ENV === 'development' && console.debug(`[LESSON] ${msg}`),
};

// When done debugging, remove all logging
// Don't leave it in production code
```

---

## Summary: The Five Issues & Prevention

| # | Issue | Root Cause | Prevention |
|---|-------|-----------|-----------|
| 1 | Lessons not discovered | Dynamic imports don't work with variable paths | Decide on fetch() vs import() architecture upfront |
| 2 | Files returning 404 | Lesson files in src/ not served by dev server | Document that static assets must go in public/ |
| 3 | Wrong URL paths | Forgot to use BASE_URL from Vite config | Document all config values that affect runtime paths |
| 4 | Frontmatter parse errors | Regex didn't handle line endings + JSON array format | Include real-world test data (Windows + Unix files) |
| 5 | Unnecessary 404 errors | Discovery loop tried all 20 files | Optimize with consecutive-miss counter |

---

## Key Takeaways

1. **Separate Concerns Early:** Know upfront whether you're doing ES6 imports or HTTP fetches
2. **Test with Real Data:** Unit tests with mocks miss line-ending and format issues
3. **Document Configuration:** Vite's base path is a runtime constant that affects all URLs
4. **Optimize I/O Loops:** With fetch/network operations, fail-fast strategies prevent cascading errors
5. **Clean Up Debug Logs:** Add detailed console logging while debugging, but remove it before committing
6. **Integration Tests Matter:** Test with actual files, actual directories, actual errors

---

## Files Changed for Phase 6 Lessons

- `src/utils/dataLoader.ts` - Switched from import() to fetch() + added BASE_URL handling
- `src/utils/frontmatterParser.ts` - Fixed regex + added JSON array parsing
- `src/components/navigation/TopicIntro.tsx` - Removed debug logs
- `public/data/categories/spoken-languages/french/numbers/lesson_*.md` - Moved from src/ to public/
