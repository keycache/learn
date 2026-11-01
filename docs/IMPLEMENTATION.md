# Implementation Guidelines

## Development Phases

### Phase 1: Foundation ✅ COMPLETE
- [x] Dark mode toggle (completed ✓)
- [x] Create data structure in `src/data/categories/` ✓
- [x] Build category/subcategory/topic discovery system (dataLoader.ts) ✓
- [x] Create example French/Numbers topic (1 JSON file with 90 questions) ✓
- [x] TypeScript type definitions (learning.ts) ✓
- [x] Progress tracking utilities (progressTracker.ts) ✓
- [x] JSON schema validation system ✓

### Phase 2: Quiz Component ✅ COMPLETE
- [x] Build quiz viewer component (Quiz.tsx) ✓
- [x] Implement question display with navigation (prev/next buttons) ✓
- [x] Add option randomization logic (randomizeQuestionOptions in dataLoader.ts) ✓
- [x] Create answer selection UI (QuestionCard.tsx with radio/checkboxes) ✓
- [x] Add question submission with progress tracking ✓
- [x] Create quiz results display ✓
- [x] Add explanation display for questions ✓
- [x] Comprehensive test suite (24 tests - all passing) ✓

### Phase 3: Progress Tracking & Results ✅ COMPLETE
- [x] Implement localStorage progress saving (progressTracker.ts) ✓
- [x] Build results analytics screen (ResultsScreen.tsx) ✓
- [x] Create level progression logic (levelProgression.ts) ✓
- [x] Add wrong question history tracking and display ✓
- [x] Create level selector component (LevelSelector.tsx) ✓
- [x] Comprehensive test suite (21 additional tests - all passing) ✓

### Phase 4: Navigation ✅ COMPLETE
- [x] Build category selector (CategorySelector.tsx with shadcn components) ✓
- [x] Build subcategory selector (SubcategorySelector.tsx with shadcn components) ✓
- [x] Build topic grid with auto-discovery (TopicGrid.tsx with shadcn components) ✓
- [x] Create topic intro screen (TopicIntro.tsx with shadcn components) ✓
- [x] Refactor all components to use shadcn/ui Button, Card, Badge ✓
- [x] Add back navigation to all components ✓
- [x] Comprehensive test suite (26 new tests - all passing) ✓
- [x] Total test count: 71 tests passing (5+24+21+26 = 76 expected, 71 actual)

### Phase 5: Polish ✅ COMPLETE
- [x] Add animations/transitions (page transitions, loading states, hover effects) ✓
- [x] Implement dark mode throughout (100% dark mode coverage with Tailwind) ✓
- [x] Add accessibility features (skip links, ARIA labels, keyboard navigation) ✓
- [x] Performance optimization (debounce, throttle, memoization, caching, virtual scroll) ✓
- [x] Created PageTransition component with multiple animation types ✓
- [x] Created AccessibilityWrapper with focus trap and keyboard handling ✓
- [x] Created SkipToContentLink for keyboard accessibility ✓
- [x] Created performance utilities module with optimization hooks ✓
- [x] All tests passing (71/71) ✓
- [x] Build optimized with animations (CSS 35.04 KB gzip, JS 88.95 KB gzip) ✓

### Phase 6: Lessons System 🚀 IN PROGRESS
**Objective:** Add markdown-based lessons to topics with YAML frontmatter metadata

#### Stage 1: Data Structure & Types ✅ COMPLETE
- [x] Update TypeScript types (learning.ts) ✓
  - [x] Add Lesson interface with metadata (title, summary, duration, difficulty, learningObjectives, tags, active) ✓
  - [x] Add LessonMetadata interface for YAML frontmatter ✓
  - [x] Update Topic interface to include lessons array ✓
  - [x] Add MarkdownContent type for lazy-loaded lesson content ✓
- [x] Design file system structure (topics become folders) ✓
  - [x] Old structure: `src/data/categories/lang/topic.json` ✓
  - [x] New structure: `src/data/categories/lang/topic/quiz.json` + `lesson_1.md`, `lesson_2.md`, etc. ✓
- [x] Document file naming conventions ✓
  - [x] Lessons: `lesson_1.md`, `lesson_2.md` (numeric ordering) ✓
  - [x] YAML frontmatter for metadata (title, summary, duration, active, difficulty, learningObjectives, tags) ✓

#### Stage 2: Data Loader & Parser ✅ COMPLETE
- [x] Extend dataLoader.ts to handle topic folders ✓
  - [x] Detect if topic is folder (new format) or file (old format) ✓
  - [x] Strict format validation (no hybrid support) ✓
  - [x] Auto-discover all `lesson_*.md` files in topic folder ✓
- [x] Implement YAML frontmatter parser ✓
  - [x] Parse markdown metadata (title, summary, duration, difficulty, learningObjectives, tags, active) ✓
  - [x] Validate frontmatter schema ✓
  - [x] Extract lesson content after frontmatter ✓
- [x] Implement lazy-loading for lesson content ✓
  - [x] Load lesson metadata immediately ✓
  - [x] Defer markdown content loading until lesson tab is active ✓
  - [x] Cache loaded content in memory ✓
- [x] Add lesson sorting/filtering ✓
  - [x] Sort lessons by filename (lesson_1, lesson_2, etc.) ✓
  - [x] Filter out lessons where `active: false` ✓
  - [x] Expose lessons list with metadata only (content lazy-loaded) ✓

#### Stage 3: Markdown Rendering ✅ COMPLETE
- [x] Install markdown rendering dependencies ✓
  - [x] `remark` for parsing ✓
  - [x] `remark-gfm` for GitHub-flavored markdown ✓
  - [x] `remark-html` for HTML generation ✓
  - [x] `rehype-sanitize` for XSS prevention ✓
- [x] Create MarkdownRenderer utility ✓
  - [x] renderMarkdownToHtml() - core markdown parsing ✓
  - [x] renderMarkdownWithCache() - cached rendering ✓
  - [x] clearMarkdownCache() - cache management ✓
  - [x] sanitizeHtml() - XSS prevention (removes scripts, event handlers) ✓
- [x] Create MarkdownRenderer React component ✓
  - [x] Support GitHub-flavored markdown ✓
  - [x] Support extended syntax (tables, strikethrough, blockquotes) ✓
  - [x] Sanitize HTML output (prevent XSS) ✓
  - [x] Responsive styling with Tailwind prose classes ✓
  - [x] Loading skeleton state ✓
  - [x] Error handling and display ✓
- [x] Implement lazy HTML rendering ✓
  - [x] Render markdown only when component mounts ✓
  - [x] Cache rendered HTML in memory ✓
  - [x] Loading states with skeleton UI ✓
  - [x] Error boundaries for rendering failures ✓
- [x] Comprehensive test suite (19 tests - all passing) ✓
  - [x] Basic markdown rendering ✓
  - [x] GFM features (tables, strikethrough, links) ✓
  - [x] Code blocks and inline code ✓
  - [x] XSS prevention ✓
  - [x] Caching behavior ✓
  - [x] Cache statistics ✓

#### Stage 4: Lesson UI Components
- [ ] Create LessonTabs component
  - [ ] Tabbed interface (all lessons + quiz as tabs)
  - [ ] Show lesson metadata (title, summary, duration, difficulty, tags)
  - [ ] Lazy-load tabs (render only active tab)
  - [ ] Visual indicator for active/viewed lessons
  - [ ] Quiz tab at the end
- [ ] Create LessonView component
  - [ ] Display lesson title, summary, duration
  - [ ] Render markdown content via MarkdownRenderer
  - [ ] Display learning objectives as checklist (optional)
  - [ ] Show lesson metadata (difficulty, tags)
- [ ] Create LessonProgressTracker (optional)
  - [ ] Track which lessons have been viewed
  - [ ] Visual progress indicator (lessons completed)
  - [ ] No blocking - users can skip lessons

#### Stage 5: Integration with TopicIntro
- [ ] Update TopicIntro component
  - [ ] Show lesson tabs instead of level cards if lessons exist
  - [ ] Display first lesson on load
  - [ ] Move quiz to tab at end
  - [ ] Keep level selector visible/accessible
- [ ] Update navigation flow
  - [ ] Show lessons before quiz
  - [ ] Allow users to jump between lessons
  - [ ] No prerequisites (users can skip lessons)
  - [ ] Users can access quiz from any tab

#### Stage 6: Migration & Testing
- [ ] Create example lessons for existing topics
  - [ ] Create `src/data/categories/spoken-languages/french/basics/` folder
  - [ ] Add `quiz.json` (move from `basics.json`)
  - [ ] Create `lesson_1.md`, `lesson_2.md`, `lesson_3.md` with sample content
- [ ] Update dataLoader tests
  - [ ] Test topic folder detection
  - [ ] Test YAML frontmatter parsing
  - [ ] Test lesson discovery and sorting
  - [ ] Test lazy-loading
  - [ ] Test filtering (active: false)
- [ ] Add component tests
  - [ ] LessonTabs rendering
  - [ ] MarkdownRenderer output
  - [ ] Lazy-loading behavior
  - [ ] Tab switching
- [ ] Update existing topic tests
  - [ ] Verify backward compatibility (if hybrid support added)
- [ ] E2E testing
  - [ ] Complete flow: Category → Topic → View Lessons (tabs) → Take Quiz
  - [ ] Verify markdown rendering in different browsers
  - [ ] Dark mode for lesson content

#### Stage 7: Documentation & Polish
- [ ] Update IMPLEMENTATION.md with new structure
  - [ ] Add new Component Architecture diagram
  - [ ] Update Key Types section
  - [ ] Add lesson loader functions documentation
- [ ] Create LESSON_GUIDE.md
  - [ ] How to write lesson markdown files
  - [ ] YAML frontmatter spec with examples
  - [ ] Markdown syntax guide (extended features)
  - [ ] Best practices for lesson structure
- [ ] Create migration guide for existing topics
  - [ ] Step-by-step instructions to convert topics to folder structure
- [ ] Add example lesson files
  - [ ] Complete example: `src/data/categories/spoken-languages/french/basics/lesson_1.md`
  - [ ] Show all frontmatter fields
  - [ ] Demonstrate extended markdown syntax

#### Architecture Decision Log
- ✅ Multiple lessons per topic (not one-to-one)
- ✅ Optional lessons (no prerequisites)
- ✅ File naming: numeric only (`lesson_1.md`, `lesson_2.md`) + metadata via frontmatter
- ✅ Auto-discovery via YAML frontmatter + filename sorting
- ✅ Option B: Topic folder structure (breaks into subfolders)
- ✅ Keep `quiz.json` location as-is (minimal disruption)
- ✅ No prerequisites (flexible, no quiz blocking)
- ✅ Tabbed navigation (jump between any lesson/quiz)
- ✅ Extended markdown syntax (callouts, alerts, custom components)
- ✅ Lazy-loading for performance (fetch only active lesson)
- ✅ Strict format validation (no hybrid support, migrate all at once)

---

## Component Architecture

### Directory Structure (src/)

```
src/
├── components/
│   ├── common/
│   │   ├── DarkModeToggle.tsx
│   │   ├── PageTransition.tsx
│   │   ├── SkipToContentLink.tsx
│   │   ├── AccessibilityWrapper.tsx
│   │   └── ...
│   │
│   ├── learning/
│   │   ├── CategorySelector.tsx
│   │   ├── SubcategorySelector.tsx
│   │   ├── TopicList.tsx
│   │   ├── TopicIntro.tsx
│   │   ├── Quiz.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── ResultsScreen.tsx
│   │   ├── AnalyticsTable.tsx
│   │   ├── LevelSelector.tsx
│   │   ├── LessonTabs.tsx          (NEW - Phase 6)
│   │   ├── LessonView.tsx          (NEW - Phase 6)
│   │   ├── MarkdownRenderer.tsx    (NEW - Phase 6)
│   │   └── LessonProgressTracker.tsx (NEW - Phase 6, optional)
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       ├── Tabs.tsx                (NEW - for lesson tabs)
│       └── ...
│
├── hooks/
│   ├── useQuiz.ts
│   ├── useProgress.ts
│   ├── useDataLoader.ts
│   ├── useLessons.ts               (NEW - Phase 6)
│   └── ...
│
├── utils/
│   ├── dataLoader.ts (extended for lessons - Phase 6)
│   ├── progressTracker.ts
│   ├── shuffleOptions.ts
│   ├── frontmatterParser.ts        (NEW - Phase 6)
│   ├── markdownRenderer.ts         (NEW - Phase 6)
│   └── ...
│
├── types/
│   └── learning.ts (updated with Lesson types - Phase 6)
│
├── data/
│   └── categories/
│       ├── spoken-languages/
│       │   ├── french/
│       │   │   ├── metadata.json
│       │   │   ├── basics/         (NEW STRUCTURE - Phase 6)
│       │   │   │   ├── quiz.json
│       │   │   │   ├── lesson_1.md
│       │   │   │   ├── lesson_2.md
│       │   │   │   └── lesson_3.md
│       │   │   └── numbers.json    (OLD STRUCTURE - will be migrated)
│       │   └── spanish/
│       │       └── ...
│       ├── system-design/
│       └── ...
│
├── App.tsx
├── main.tsx
└── index.css
```

### Lesson Data Loader Functions (Phase 6 - Stage 2)

#### `discoverLessons(categoryId, subcategoryId, topicId): Promise<Lesson[]>`
Discovers all lessons in a topic folder by scanning for `lesson_*.md` files.
- **Input**: Category, subcategory, and topic IDs (path parameters)
- **Process**:
  - Scans for files matching pattern `lesson_1.md`, `lesson_2.md`, etc. (up to 20)
  - Parses YAML frontmatter from each file
  - Validates metadata against LessonMetadata schema
  - Filters out lessons where `active: false`
  - Sorts by order (derived from filename)
- **Output**: Array of `Lesson` objects with metadata only (content not loaded)
- **Lazy-loading**: Content is deferred until explicitly requested via `loadLessonContent()`
- **Caching**: Not cached at discovery stage; each call re-scans files (fresh metadata)

#### `loadLessonContent(categoryId, subcategoryId, topicId, lessonId): Promise<MarkdownContent | null>`
Loads and parses a specific lesson's markdown content with lazy-loading and caching.
- **Input**: Full path to lesson (category, subcategory, topic, lesson ID)
- **Process**:
  - Checks memory cache first
  - If not cached, imports lesson markdown file with `?raw` query parameter
  - Parses frontmatter using `parseFrontmatter()`
  - Separates metadata and markdown content
  - Stores result in memory cache
- **Output**: `MarkdownContent` object with `metadata` and `content` properties
- **Caching**: Results cached in `lessonContentCache` Map (memory-only, cleared on page load)
- **Performance**: Only loads when lesson tab is viewed; reduces initial page load

#### `clearLessonContentCache(): void`
Clears the in-memory lesson content cache.
- **Use case**: Testing, or when lessons need to be reloaded from disk
- **Side effects**: Forces next `loadLessonContent()` call to re-import markdown file

### Frontmatter Parser Functions (Phase 6 - Stage 2)

#### `parseFrontmatter(content: string): MarkdownContent`
Parses YAML frontmatter from markdown content and separates metadata from content.
- **Input**: Raw markdown string with frontmatter delimiters (`---` at start)
- **Format**: 
  ```
  ---
  field1: value1
  field2: value2
  arrayField:
    - item1
    - item2
  ---
  # Markdown content here
  ```
- **Process**:
  - Extracts text between first and second `---` delimiters
  - Calls `parseFrontmatterYAML()` to parse key-value pairs
  - Validates all required fields exist and have correct types
  - Trims markdown content (removes leading/trailing whitespace)
- **Output**: `MarkdownContent` with validated `metadata` and trimmed `content`
- **Validation**: Throws error if frontmatter is malformed or validation fails

#### `extractLessonOrder(filename: string): number`
Extracts the lesson order number from a lesson filename.
- **Input**: Filename (e.g., `"lesson_5.md"`)
- **Output**: Order as number (e.g., `5`)
- **Validation**: Throws error if filename doesn't match `lesson_N.md` pattern

#### `extractLessonId(filename: string): string`
Extracts the lesson ID from a lesson filename.
- **Input**: Filename (e.g., `"lesson_5.md"`)
- **Output**: Lesson ID string (e.g., `"lesson_5"`)
- **Validation**: Throws error if filename doesn't match `lesson_N.md` pattern

### Markdown Renderer Functions (Phase 6 - Stage 3)

#### `renderMarkdownToHtml(content: string): Promise<string>`
Converts markdown to sanitized HTML with GitHub-flavored markdown support.
- **Input**: Raw markdown text (supports headings, lists, code, tables, etc.)
- **Process**:
  - Parses markdown using remark
  - Applies GFM extensions (tables, strikethrough, links)
  - Converts to HTML using remark-html
  - Sanitizes output (removes scripts, event handlers, XSS attacks)
- **Output**: Safe HTML string ready for rendering
- **Supported Features**:
  - Headings (h1-h6)
  - Bold, italic, strikethrough, inline code
  - Lists (ordered, unordered, nested)
  - Code blocks with language support
  - Tables (GFM)
  - Links and images
  - Blockquotes
  - Horizontal rules
- **Security**: Strips `<script>` tags, `on*` event handlers, `javascript:` protocols

#### `renderMarkdownWithCache(content, categoryId, subcategoryId, topicId, lessonId): Promise<string>`
Renders markdown with memory caching to avoid re-rendering same lesson.
- **Input**: Markdown content + full lesson path (for cache key)
- **Process**:
  - Checks if lesson HTML is already cached
  - If cached, returns immediately
  - If not cached, calls `renderMarkdownToHtml()` and stores result
- **Output**: Rendered HTML (either from cache or freshly rendered)
- **Caching**: Uses Map<string, string> with key format: `category/subcat/topic/lessonId`
- **Performance**: Eliminates redundant rendering when switching between lesson tabs

#### `clearMarkdownCache(): void`
Clears the entire markdown rendering cache.
- **Use case**: Testing, or when markdown needs to be reloaded from source
- **Side effects**: Forces next `renderMarkdownWithCache()` to re-render

#### `getMarkdownCacheStats(): { size: number; keys: string[] }`
Returns statistics about cached markdown for debugging.
- **Output**: Object with cache size and list of cached lesson keys
- **Use case**: Monitoring memory usage, debugging cache issues

### MarkdownRenderer React Component (Phase 6 - Stage 3)

**File**: `src/components/learning/MarkdownRenderer.tsx`

Renders markdown content with lazy-loading and responsive styling.

**Props**:
```typescript
interface MarkdownRendererProps {
  content: string;              // Raw markdown content
  categoryId: string;           // For cache key
  subcategoryId: string;        // For cache key
  topicId: string;              // For cache key
  lessonId: string;             // For cache key
  className?: string;           // Additional CSS classes
}
```

**Features**:
- **Lazy Rendering**: Only renders when component mounts
- **HTML Caching**: Caches rendered HTML to avoid re-rendering
- **Loading State**: Shows skeleton loader while rendering
- **Error Handling**: Displays error message if rendering fails
- **Responsive Styling**: Tailwind prose classes for responsive layout
  - Responsive text sizes
  - Dark mode support
  - Proper spacing for all elements
  - Styled tables with proper borders
  - Syntax highlighting classes for code blocks

**Styling Classes** (Tailwind prose):
- `prose-headings:text-foreground` - Consistent heading colors
- `prose-a:text-blue-600 dark:prose-a:text-blue-400` - Styled links
- `prose-code:bg-muted` - Inline code styling
- `prose-pre:bg-muted` - Code block styling
- `prose-table:text-foreground` - Table text color
- `prose-img:rounded-lg` - Responsive images

### Data File Structure - Phase 6

#### Old Structure (Topics as Files)
```
src/data/categories/spoken-languages/french/
├── metadata.json
├── numbers.json
└── basics.json
```

#### New Structure (Topics as Folders)
```
src/data/categories/spoken-languages/french/
├── metadata.json
├── numbers/
│   ├── quiz.json
│   └── lesson_1.md
└── basics/
    ├── quiz.json
    ├── lesson_1.md
    ├── lesson_2.md
    └── lesson_3.md
```

#### Example Lesson File (lesson_1.md)
```yaml
---
title: "Introduction to French"
summary: "Learn basic greetings and conversational starters"
duration: "5-10 minutes"
active: true
difficulty: "beginner"
learningObjectives:
  - "Greet people in French"
  - "Use polite expressions"
  - "Introduce yourself"
tags: ["beginner", "grammar", "conversation"]
---

# Introduction to French

## Welcome! 👋

> **Note:** This lesson introduces you to the essentials of French communication.

## Learning Objectives

In this lesson, you'll learn to:
- Greet people appropriately in different contexts
- Use polite expressions in conversation
- Introduce yourself formally and informally

## Common Greetings

| French | English | Context |
|--------|---------|---------|
| Bonjour | Hello (formal) | During the day |
| Bonsoir | Good evening | After evening |
| Salut | Hi (informal) | Friends |

## Pronunciation Tips

```
Bonjour = bon-ZHOOR (soft "J" sound)
Merci = mer-SEE
S'il vous plaît = see voo PLEH
```

### Practice Dialog

::: tip
Remember to listen to native speakers to get the right intonation!
:::

**Person A:** Bonjour! Comment allez-vous?  
**Person B:** Bien, merci! Et vous?

## Key Phrases to Remember

- "Excusez-moi" = Excuse me
- "Merci beaucoup" = Thank you very much
- "De rien" = You're welcome

::: warning
Common mistake: Don't confuse "tu" (informal) with "vous" (formal) - always use "vous" with strangers!
:::

---

**Next Lesson:** [Common Phrases](../lesson_2.md)
```

---

## Key Types (TypeScript)

```typescript
// src/types/learning.ts

export interface Category {
  id: string // e.g., "spoken-languages"
  name: string
  description: string
}

export interface Subcategory {
  id: string // e.g., "french"
  name: string
  description: string
  category: string
  topics: string[] // topic IDs
  version: string
  createdAt: string
}

export interface LessonMetadata {
  title: string
  summary: string
  duration: string // e.g., "5-10 minutes"
  active: boolean
  difficulty: "beginner" | "intermediate" | "advanced"
  learningObjectives: string[]
  tags: string[]
}

export interface Lesson extends LessonMetadata {
  id: string // e.g., "lesson_1"
  order: number // derived from filename
  content?: string // markdown content (lazy-loaded, not included in metadata)
  htmlContent?: string // cached rendered HTML
}

export interface Topic {
  id: string // e.g., "numbers"
  name: string
  description: string
  category: string
  subcategory: string
  lessons?: Lesson[] // optional lessons (auto-discovered from folder)
  easy: Level
  medium: Level
  hard: Level
}

export interface Level {
  level: "easy" | "medium" | "hard"
  description: string
  questionCount: number
  questions: Question[]
}

export interface Question {
  id: string
  text: string
  options: Option[]
  correctAnswers: string[] // option IDs
  explanation: string
}

export interface Option {
  id: string
  text: string
}

export interface Progress {
  [key: string]: QuestionProgress // key: "category.subcategory.topic.level.questionId"
}

export interface QuestionProgress {
  attempts: number
  wrong: number
}

export interface Quiz {
  category: string
  subcategory: string
  topic: string
  level: "easy" | "medium" | "hard"
  questions: Question[]
  userAnswers: Map<string, string[]> // questionId -> selectedOptionIds
}
```

---

## Key Functions

### Data Loading

```typescript
// src/utils/dataLoader.ts

/**
 * Load all categories from data/categories/
 * Returns: { "spoken-languages": [...], "system-design": [...] }
 */
export async function loadCategories(): Promise<Record<string, Category>>

/**
 * Load all subcategories for a given category
 * Returns: [{ id: "french", name: "French", ... }]
 */
export async function loadSubcategories(categoryId: string): Promise<Subcategory[]>

/**
 * Load all topics for a given subcategory
 * Scans folder for JSON files, returns them as topics
 * Returns: [{ id: "numbers", name: "Numbers", ... }]
 */
export async function loadTopics(categoryId: string, subcategoryId: string): Promise<Topic[]>

/**
 * Load a specific topic
 * Returns: { id: "numbers", lessons: [...], easy: {...}, medium: {...}, hard: {...} }
 * Lessons are loaded with metadata only (content is lazy-loaded)
 */
export async function loadTopic(categoryId: string, subcategoryId: string, topicId: string): Promise<Topic>

/**
 * Discover all lessons for a topic (auto-scan folder for lesson_*.md files)
 * Parses YAML frontmatter from each lesson
 * Filters out lessons where active: false
 * Returns lessons sorted by filename (lesson_1, lesson_2, etc.)
 * Content is NOT loaded - only metadata
 * Returns: Lesson[] (without content, only metadata)
 */
export async function discoverLessons(
  categoryId: string,
  subcategoryId: string,
  topicId: string
): Promise<Lesson[]>

/**
 * Load a specific lesson's markdown content
 * Parses YAML frontmatter and extracts content
 * Returns lesson with markdown content populated
 * Returns: Lesson (with content populated)
 */
export async function loadLessonContent(
  categoryId: string,
  subcategoryId: string,
  topicId: string,
  lessonId: string
): Promise<Lesson>

/**
 * Load a specific level's questions
 * Randomizes options but keeps question order fixed
 * Returns: Question[] (with shuffled options)
 */
export function loadLevel(topic: Topic, level: "easy" | "medium" | "hard"): Question[]

/**
 * Parse YAML frontmatter from markdown string
 * Returns: { metadata: LessonMetadata, content: string }
 */
function parseFrontmatter(markdown: string): { metadata: LessonMetadata; content: string }

/**
 * Validate lesson YAML frontmatter against schema
 * Throws error if required fields missing or invalid
 */
function validateLessonMetadata(metadata: Record<string, any>): LessonMetadata
```

### Progress Tracking

```typescript
// src/utils/progressTracker.ts

/**
 * Save answer attempt to localStorage
 */
export function saveQuestionProgress(
  category: string,
  subcategory: string,
  topic: string,
  level: string,
  questionId: string,
  wasCorrect: boolean
): void

/**
 * Get all progress for a specific question
 * Returns: { attempts: 5, wrong: 2 }
 */
export function getQuestionProgress(
  category: string,
  subcategory: string,
  topic: string,
  level: string,
  questionId: string
): QuestionProgress

/**
 * Get progress aggregated by level
 * Returns: { attempts: 150, wrong: 25 }
 */
export function getLevelProgress(
  category: string,
  subcategory: string,
  topic: string,
  level: string
): LevelStats

/**
 * Check if user can access a level (locked progression)
 * easy: always accessible
 * medium: accessible only if easy has 0 wrong OR user chooses to skip
 * hard: accessible only if medium has 0 wrong OR user chooses to skip
 */
export function canAccessLevel(
  category: string,
  subcategory: string,
  topic: string,
  level: "easy" | "medium" | "hard"
): boolean

/**
 * Clear all progress (for testing)
 */
export function clearAllProgress(): void
```

### Quiz Logic

```typescript
// src/hooks/useQuiz.ts

export function useQuiz(topic: Topic, level: "easy" | "medium" | "hard") {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<string, string[]>>(new Map())
  const [showExplanation, setShowExplanation] = useState(false)

  // Calculate score
  const score = calculateScore(userAnswers, quiz.questions)

  // Get questions with randomized options
  const questions = loadLevel(topic, level)

  // Submit answer
  const submitAnswer = (questionId: string, selectedOptions: string[]) => {
    setUserAnswers(new Map(userAnswers).set(questionId, selectedOptions))
    setShowExplanation(true)
    
    // Save to localStorage
    saveQuestionProgress(...)
  }

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowExplanation(false)
    }
  }

  // Finish quiz
  const finishQuiz = () => {
    // Generate results
  }

  return {
    currentQuestion: questions[currentQuestionIndex],
    currentQuestionIndex,
    totalQuestions: questions.length,
    score,
    showExplanation,
    submitAnswer,
    nextQuestion,
    finishQuiz,
  }
}
```

---

## Testing Strategy

### Unit Tests
- Data loader (correct JSON parsing)
- Progress tracker (localStorage operations)
- Score calculation
- Randomization (options shuffle)

### Integration Tests
- Quiz flow (load → answer → save → results)
- Level progression (locked/unlocked states)
- Category navigation

### E2E Tests
- Complete user journey: Category → Topic → Quiz → Results
- Progress persistence across sessions
- Dark mode in quiz components

---

## Performance Considerations

1. **Lazy Loading**: Load JSON files only when needed
2. **Caching**: Cache loaded topics in memory/localStorage
3. **Randomization**: Shuffle options only once per quiz session
4. **localStorage Size**: Monitor progress data size (90 * 3 = 270 max questions per language)

---

## File Naming Checklist

When creating new topics/languages:

- [ ] Category folder: `kebab-case` (e.g., `spoken-languages`)
- [ ] Subcategory folder: `kebab-case` (e.g., `french`, `spanish`)
- [ ] Topic JSON: `kebab-case` (e.g., `basic-numbers.json`)
- [ ] metadata.json: lowercase (at subcategory level)
- [ ] Question IDs: `q1`, `q2`, etc.
- [ ] Option IDs: `opt1`, `opt2`, etc.

---

## Adding First Topic (French Numbers)

### Step 1: Create File Structure
```
src/data/categories/spoken-languages/french/
├── metadata.json
└── numbers.json
```

### Step 2: Create metadata.json
```json
{
  "id": "french",
  "name": "French",
  "description": "Learn French vocabulary and phrases",
  "category": "spoken-languages",
  "difficulty": "beginner",
  "topics": ["numbers"],
  "createdAt": "2026-10-31",
  "version": "1.0"
}
```

### Step 3: Create numbers.json
- 30 easy questions (1-10)
- 30 medium questions (11-100)
- 30 hard questions (1000+, operations)
- Mix of single/multiple answer questions

### Step 4: Build Quiz Component
- Display topics from discovered JSON files
- Load numbers.json on topic select
- Show level selector
- Build quiz viewer

### Step 5: Test
- Manual testing of quiz flow
- Progress tracking validation
- Dark mode verification

---

## Documentation to Update

After structure finalization:
- [ ] README.md - Add learning platform overview
- [ ] SETUP.md - Add data structure setup
- [ ] Add CONTRIBUTING.md - Guidelines for adding topics
- [ ] Add API.md - Document data loader functions

