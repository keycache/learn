# Dev Lesson/Quiz Generator Architecture

## Overview
A development-only UI for generating lessons and quizzes using LLM providers (starting with OpenRouter, extensible to others). The feature is completely excluded from production builds via tree-shaking with `import.meta.env.DEV`.

**Status**: Architecture planned, awaiting implementation approval.

---

## 1. Build & Deployment Strategy

### Tree-Shaking Approach
- Dev generator route only loads when `import.meta.env.DEV === true`
- Vite automatically excludes all dev-only code from production build
- Zero bundle size impact on production
- API endpoint also dev-only via Vite plugin middleware

### File Structure
```
src/routes/dev/
  ├── index.tsx              # Route entry point (wrapped in DEV check)
  ├── DeveloperGenerator.tsx  # Root layout component with tabs
  ├── tabs/
  │   ├── LLMSettings.tsx    # API key management + connection testing
  │   ├── Selection.tsx      # Category/subcategory/topic picker
  │   ├── Lessons.tsx        # Lesson generation form
  │   └── Quizzes.tsx        # Quiz generation form
  ├── hooks/
  │   ├── useLessonPrompt.ts
  │   ├── useQuizPrompt.ts
  │   ├── useOpenRouter.ts
  │   └── useFileSystem.ts
  └── types/
      ├── lesson.ts
      └── quiz.ts

src/services/llm/
  ├── providers/
  │   ├── LLMProvider.interface.ts  # Adapter interface
  │   ├── OpenRouterProvider.ts
  │   ├── ClaudeProvider.ts         # Future
  │   └── index.ts
  └── prompts/
      ├── lessonPrompts.ts
      └── quizPrompts.ts
```

---

## 2. UI Layout & Navigation

### Tab Structure (4 tabs)
```
┌────────────────────────────────────────────┐
│  Developer Generator                       │
├──────┬──────────┬─────────┬──────────────┤
│ LLM  │ Selection│ Lessons │ Quizzes      │
│ Cfg  │          │         │              │
├─────────────────────────────────────────┤
│                                          │
│  [Tab content varies by selected tab]    │
│                                          │
└─────────────────────────────────────────┘
```

### Tab 1: LLM Settings
**Purpose**: Configure LLM provider and authenticate

**Components**:
- Provider selector dropdown (OpenRouter, Claude, etc.)
- API key input field
- Connection test button with status feedback
  - ✅ Green checkmark: Connected
  - ❌ Red X: Failed + error message
- Settings persist in localStorage across page reloads

**Flow**:
```
User enters API key
        ↓
Click "Test Connection"
        ↓
Send test request to LLM provider
        ↓
Display result: ✅ or ❌ + message
        ↓
If ✅: Save to localStorage, enable Generation tabs
If ❌: Keep form editable, show error
```

### Tab 2: Selection
**Purpose**: Select or create category/subcategory/topic

**Form Structure**:
```
Category Dropdown
├── [Select from file system]
├── [+ Create New]

Subcategory Dropdown (cascading)
├── [Options based on selected category]
├── [+ Create New]

Topic Dropdown (cascading)
├── [Options based on selected subcategory]
├── [+ Create New]

Lesson/Quiz Selector (radio buttons)
○ Lesson
○ Quiz
```

**Create New Flow**:
- Category: Name field (required)
- Subcategory: Name field (required)
- Topic: Name field (required)
- Creates folder structure on first generation to that path

**Data Source**: File system read via API (dev endpoint) to fetch categories/subcategories/topics

### Tab 3: Lessons
**Purpose**: Generate lesson with customized prompt

**Form Fields**:
```
Topic (auto-filled from Selection tab)
├── Text, read-only, sourced from Selection tab

Target Age Group (dropdown)
├── 5-8 years
├── 9-12 years
├── 13-18 years
├── 18+ years

Lesson Duration (dropdown)
├── 15 minutes
├── 30 minutes
├── 45 minutes
├── 60 minutes

Custom Instructions (textarea - MANDATORY)
├── Large text area
├── Placeholder: "Describe what the lesson should focus on..."
├── e.g., "Focus on practical conversational French, include dialogues"

[User Prompt Template Display]
├── Large read-only text box showing full template
├── Populated with all selected values + JSON schema
├── Schema included as code block in prompt

[Generate Lesson] button
```

**Prompt Template Structure**:
```
System Prompt (NOT shown to user):
"You are an expert language instructor creating lessons..."

User Prompt (SHOWN in text field, auto-populated):
```
Create a language lesson with the following parameters:

Target Age Group: {selected_age_group}
Duration: {selected_duration}
Topic: {topic_name}
Custom Instructions: {custom_instructions}

Output Format (JSON Schema):
{
  "title": "string (lesson title)",
  "objectives": ["string[] (learning objectives)"],
  "sections": [
    {
      "title": "string",
      "content": "string (markdown: supports tables, code blocks, lists, emphasis)"
    }
  ],
  "keyTakeaways": ["string[]"],
  "metadata": {
    "ageGroup": "{age_group}",
    "duration": "{duration}",
    "language": "French",
    "createdAt": "{timestamp}"
  }
}

Please generate a complete lesson in this exact JSON format.
```

### Tab 4: Quizzes
**Purpose**: Generate quiz with customized prompt

**Form Fields**:
```
Topic (auto-filled from Selection tab)
├── Text, read-only

Lesson Selector (dropdown)
├── [All lessons in selected topic]
├── Shows lesson titles with dates
├── REQUIRED: Choose which lesson this quiz tests

Questions per Difficulty (inputs with defaults)
├── Easy: [30] (default)
├── Medium: [30] (default)
├── Hard: [30] (default)
├── Total: [auto-calculated: 90]

Custom Instructions (textarea - MANDATORY)
├── e.g., "Focus on grammar, avoid cultural references"

[User Prompt Template Display]
├── Shows full template with schema

[Generate Quiz] button
```

**Prompt Template Structure**:
```
User Prompt (shown to user):
```
Create a language learning quiz for a lesson on: {lesson_title}

Quiz Configuration:
- Easy questions: {easy_count}
- Medium questions: {medium_count}
- Hard questions: {hard_count}
- Total questions: {total_count}

Custom Requirements: {custom_instructions}

Output Format (JSON Schema):
{
  "title": "string",
  "lesson_id": "{lesson_id}",
  "quiz_version": 1,
  "questions": [
    {
      "id": "string (unique)",
      "type": "multiple-choice | true-false | short-answer",
      "question": "string",
      "options": ["string"] (for multiple-choice/true-false),
      "correctAnswer": "string | number",
      "explanation": "string",
      "difficulty": "easy | medium | hard",
      "points": 1
    }
  ],
  "metadata": {
    "totalQuestions": {total_count},
    "createdAt": "{timestamp}",
    "lessonId": "{lesson_id}"
  }
}

Generate exactly {total_count} questions in this JSON format.
```

---

## 3. LLM Provider Architecture

### Adapter Pattern

**LLMProvider Interface**:
```typescript
interface LLMProvider {
  name: string;
  supportsImage: boolean;
  supportsText: boolean;
  
  validateApiKey(apiKey: string): Promise<boolean>;
  sendMessage(params: {
    systemPrompt: string;
    userPrompt: string;
    apiKey: string;
    model?: string;
  }): Promise<string>;
}
```

**OpenRouterProvider Implementation**:
```typescript
class OpenRouterProvider implements LLMProvider {
  name = 'OpenRouter';
  supportsImage = true;
  supportsText = true;
  
  async validateApiKey(apiKey: string): Promise<boolean> {
    // POST to OpenRouter test endpoint
  }
  
  async sendMessage(params): Promise<string> {
    // POST to OpenRouter API
  }
}
```

**Provider Registry**:
```typescript
const providers: Record<string, LLMProvider> = {
  openRouter: new OpenRouterProvider(),
  // claude: new ClaudeProvider(), // Future
  // gpt: new GPTProvider(), // Future
};
```

### API Key Management
- Stored in `localStorage` under `dev_llm_apikeys`
- Format: `{ [provider]: string }`
- Fetched on app load if available
- User can update/delete keys in LLM Settings tab
- Never logged or exposed in network requests beyond the LLM API itself

---

## 4. Data Model & File Organization

### Lesson Output Schema
```typescript
interface Lesson {
  title: string;
  objectives: string[];
  sections: LessonSection[];
  keyTakeaways: string[];
  metadata: {
    ageGroup: string;
    duration: string;
    language: string;
    createdAt: string;
  };
}

interface LessonSection {
  title: string;
  content: string; // Markdown (supports tables, code, lists)
}
```

**File Storage**:
```
/data/categories/[category]/[subcategory]/[topic]/
├── lesson-[topic-id]-v1.md
├── lesson-[topic-id]-v2.md
├── lesson-[topic-id]-v3.md
└── ...
```

**File Format**: Markdown with frontmatter
```yaml
---
title: "French Basics - Greetings"
objectives:
  - "Learn basic French greetings"
  - "Practice pronunciation"
ageGroup: "9-12 years"
duration: "30 minutes"
language: "French"
createdAt: "2026-11-01T21:43:00Z"
---

## Objectives
- Understand common greetings
- Practice with native speaker examples

## Section 1: Common Greetings
...
```

### Quiz Output Schema
```typescript
interface Quiz {
  title: string;
  lesson_id: string;
  quiz_version: number;
  questions: QuizQuestion[];
  metadata: {
    totalQuestions: number;
    createdAt: string;
    lessonId: string;
  };
}

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}
```

**File Storage**:
```
/data/categories/[category]/[subcategory]/[topic]/
├── quiz-[lesson-id]-v1.json
├── quiz-[lesson-id]-v2.json
└── ...
```

**Version Management**:
- Auto-increment on generation
- Existing quiz-[lesson-id]-v1.json → new version becomes v2
- User can see all versions in UI

---

## 5. Post-Generation Workflow

### Lesson Generation Flow
```
User fills form + clicks "Generate Lesson"
        ↓
Validate custom instructions (required)
        ↓
Send to LLM with prompt + schema
        ↓
Parse response JSON
        ↓
Validate against schema
        ↓
If validation fails:
  ├─ Show error with parsed response
  ├─ Option 1: "Manual Fix" → Show JSON editor
  ├─ Option 2: "Retry" → Regenerate with adjusted prompt
  └─ Option 3: "View Raw" → Show LLM response as-is
        ↓
If validation passes:
  ├─ Show Markdown preview of lesson
  ├─ User can review content
  ├─ [Save] button → Write to file system + show success
  └─ [Edit] button → Open JSON editor for tweaks
```

### Quiz Generation Flow
```
Similar to lesson, but:
  ├─ Parse response into Quiz object
  ├─ Validate schema + question count
  ├─ Show JSON preview (not markdown)
  ├─ Save as quiz-[lesson-id]-v{N}.json
  └─ Show success with file path
```

---

## 6. Prompt Templates

### Lesson Prompt Template
Location: `src/services/llm/prompts/lessonPrompts.ts`

```typescript
export const lessonPrompts = {
  system: `You are an expert language instructor specializing in creating engaging, 
structured lessons for diverse age groups. Your lessons are well-organized with clear 
objectives, practical examples, and memorable takeaways.`,
  
  userTemplate: (params: {
    topic: string;
    ageGroup: string;
    duration: string;
    customInstructions: string;
    schema: object;
  }) => `
Create a language lesson with the following parameters:

Target Age Group: ${params.ageGroup}
Duration: ${params.duration}
Topic: ${params.topic}
Custom Instructions: ${params.customInstructions}

Output Format (JSON Schema):
\`\`\`json
${JSON.stringify(params.schema, null, 2)}
\`\`\`

Please generate a complete lesson in this exact JSON format.`
};
```

### Quiz Prompt Template
Location: `src/services/llm/prompts/quizPrompts.ts`

```typescript
export const quizPrompts = {
  system: `You are an expert in creating effective language learning quizzes. Your 
questions are varied, fair, and test both comprehension and application.`,
  
  userTemplate: (params: {
    lessonTitle: string;
    lessonId: string;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    customInstructions: string;
    schema: object;
  }) => `
Create a language learning quiz for a lesson on: ${params.lessonTitle}

Quiz Configuration:
- Easy questions: ${params.easyCount}
- Medium questions: ${params.mediumCount}
- Hard questions: ${params.hardCount}
- Total questions: ${params.easyCount + params.mediumCount + params.hardCount}

Custom Requirements: ${params.customInstructions}

Output Format (JSON Schema):
\`\`\`json
${JSON.stringify(params.schema, null, 2)}
\`\`\`

Generate exactly ${params.easyCount + params.mediumCount + params.hardCount} questions in this JSON format.`
};
```

---

## 7. API Endpoints (Dev-only)

### POST /api/dev/generate-lesson
**Purpose**: Send lesson prompt to LLM
**Dev-only**: Yes (Vite plugin middleware, excluded from production)

```typescript
// Request
{
  systemPrompt: string;
  userPrompt: string;
  provider: 'openRouter' | 'claude';
  apiKey: string;
}

// Response
{
  content: string; // LLM response (should be JSON)
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}
```

### POST /api/dev/generate-quiz
**Purpose**: Send quiz prompt to LLM

### GET /api/dev/filesystem
**Purpose**: Fetch categories/subcategories/topics from file system

```typescript
// Request params
?type=categories|subcategories|topics
?category=string (if type=subcategories)
?category=string&subcategory=string (if type=topics)

// Response
["category1", "category2", ...]
```

### POST /api/dev/test-connection
**Purpose**: Test LLM API key validity

```typescript
// Request
{
  provider: 'openRouter';
  apiKey: string;
}

// Response
{
  success: boolean;
  message: string;
  error?: string;
}
```

---

## 8. Data Validation & Error Handling

### Lesson Validation
```typescript
interface LessonValidator {
  validateSchema(output: unknown): output is Lesson;
  validateMarkdown(content: string): boolean;
  validateMetadata(metadata: object): boolean;
}

// On validation failure:
// 1. Log the invalid response
// 2. Show user-friendly error message
// 3. Offer retry or manual fix options
```

### Quiz Validation
```typescript
interface QuizValidator {
  validateSchema(output: unknown): output is Quiz;
  validateQuestionCount(questions: unknown[], expected: number): boolean;
  validateDifficultyDistribution(questions: QuizQuestion[]): boolean;
}
```

---

## 9. State Management

### Context Providers
```typescript
// LLMSettingsContext
interface LLMSettings {
  provider: string;
  apiKey: string;
  isConnected: boolean;
  lastTestedAt: string;
}

// SelectionContext
interface Selection {
  category: string | null;
  subcategory: string | null;
  topic: string | null;
  type: 'lesson' | 'quiz' | null;
}

// GenerationContext
interface Generation {
  isLoading: boolean;
  error: string | null;
  result: Lesson | Quiz | null;
  validationErrors: string[];
}
```

### localStorage Keys
```
dev_llm_settings: { provider, isConnected, lastTestedAt }
dev_llm_apikeys: { [provider]: apiKey }
dev_selection: { category, subcategory, topic, type }
```

---

## 10. Future Enhancements

- [ ] Additional LLM providers (Claude, GPT-4, etc.)
- [ ] Batch generation (multiple lessons/quizzes at once)
- [ ] Template customization (user-defined prompt prefixes)
- [ ] Version comparison (diff between lesson versions)
- [ ] Quiz preview + test run
- [ ] Lesson import/export (share templates)
- [ ] Analytics (track generation success/failure rates)

---

## 11. Testing Strategy

### Unit Tests
- `OpenRouterProvider.test.ts`: API calls, validation
- `LessonValidator.test.ts`: Schema validation
- `QuizValidator.test.ts`: Schema validation + question count

### Integration Tests
- Full workflow: selection → generation → validation → save
- File system operations: read categories, write lessons/quizzes
- API communication with mock LLM response

### E2E Tests (manual)
- User creates new category/subcategory/topic
- User generates lesson, reviews, and saves
- User generates quiz for lesson, verifies questions
- API key management and connection testing

---

## 12. Implementation Checklist

- [ ] Component structure (DeveloperGenerator + tabs)
- [ ] LLM provider adapter + OpenRouter implementation
- [ ] API key management (localStorage + validation)
- [ ] Tab 1: LLM Settings
  - [ ] Provider selector
  - [ ] API key input
  - [ ] Connection test + status display
- [ ] Tab 2: Selection (cascading dropdowns + create new)
- [ ] Tab 3: Lessons (form + prompt template + generation)
- [ ] Tab 4: Quizzes (form + prompt template + generation)
- [ ] Validators (lesson + quiz schema)
- [ ] Error handling + retry logic
- [ ] Preview UI (markdown for lessons, JSON for quizzes)
- [ ] File system operations (save lessons/quizzes)
- [ ] Dev-only API endpoints in Vite config
- [ ] localStorage persistence
- [ ] Tree-shaking verification (production build)

---

## Summary

**Dev generator is a powerful tool for content creation that:**
- ✅ Stays completely isolated from production via tree-shaking
- ✅ Uses extensible LLM provider pattern for future integrations
- ✅ Validates all LLM output against JSON schemas
- ✅ Provides clear user feedback at each step
- ✅ Persists settings across sessions
- ✅ Integrates with existing file system structure

**Next step**: Implementation approval + phase breakdown
