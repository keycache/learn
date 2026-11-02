# Dev Generator - Quick Reference Card

**Print this page and keep it handy during implementation!**

---

## 4-Tab Structure

```
Tab 1: LLM Settings        Tab 2: Selection         Tab 3: Lessons           Tab 4: Quizzes
─────────────────────      ──────────────────       ──────────────           ──────────────
Provider Dropdown          Category Dropdown         Topic (auto)             Topic (auto)
API Key Input              + Create New              Age Group ▼             Lesson Selector ▼
Test Connection Button     
                           Subcategory Dropdown      Duration ▼              Easy Count: 30
✅/❌ Feedback             + Create New                                       Medium Count: 30
                                                    Custom Instr.*            Hard Count: 30
localStorage              Topic Dropdown            (MANDATORY)
persistence               + Create New              
                                                    Prompt Preview           Custom Instr.*
                          Lesson/Quiz Radio                                  (MANDATORY)
                          ○ Lesson                  [Generate] Button        
                          ○ Quiz                    
                                                    Prompt Preview           [Generate] Button
                                                                             
                          [Next: Lessons or        Markdown Preview         JSON Preview
                           Quizzes Tab]            or Error + Options        or Error + Options
```

---

## Form Field Defaults

| Field | Options | Default |
|-------|---------|---------|
| Age Group | 5-8 years, 9-12 years, 13-18 years, 18+ years | (required) |
| Duration | 15 min, 30 min, 45 min, 60 min | (required) |
| Questions (Easy) | 1-100 | 30 |
| Questions (Medium) | 1-100 | 30 |
| Questions (Hard) | 1-100 | 30 |
| Custom Instructions | Text (MANDATORY) | (required) |

---

## Data Schemas (Shortened)

### Lesson
```json
{
  "title": string,
  "objectives": [string],
  "sections": [{ "title": string, "content": "markdown" }],
  "keyTakeaways": [string],
  "metadata": {
    "ageGroup": "5-8|9-12|13-18|18+",
    "duration": "15|30|45|60 minutes",
    "language": string,
    "createdAt": "ISO 8601"
  }
}
```

### Quiz
```json
{
  "title": string,
  "lesson_id": string,
  "quiz_version": 1,
  "questions": [
    {
      "id": string,
      "type": "multiple-choice|true-false|short-answer",
      "question": string,
      "options": [string],           // required for MC/TF
      "correctAnswer": string|number,
      "explanation": string,
      "difficulty": "easy|medium|hard",
      "points": 1-10
    }
  ],
  "metadata": {
    "totalQuestions": number,
    "createdAt": "ISO 8601",
    "lessonId": string
  }
}
```

---

## File Locations

### Components
```
/src/routes/dev/
  ├── index.tsx
  ├── DeveloperGenerator.tsx
  ├── tabs/
  │   ├── LLMSettings.tsx
  │   ├── Selection.tsx
  │   ├── Lessons.tsx
  │   └── Quizzes.tsx
  ├── hooks/
  │   ├── useLessonPrompt.ts
  │   ├── useQuizPrompt.ts
  │   ├── useOpenRouter.ts
  │   └── useFileSystem.ts
  └── types/
      ├── lesson.ts
      └── quiz.ts
```

### Services
```
/src/services/llm/
  ├── providers/
  │   ├── LLMProvider.interface.ts
  │   ├── OpenRouterProvider.ts
  │   └── index.ts
  └── prompts/
      ├── lessonPrompts.ts
      └── quizPrompts.ts
```

### Generated Files
```
/data/categories/[category]/[subcategory]/[topic]/
  ├── lesson-[slug]-v1.md
  ├── lesson-[slug]-v2.md
  └── quiz-[lesson-id]-v1.json
```

---

## API Endpoints

```
POST /api/dev/generate-lesson
  Body: { systemPrompt, userPrompt, provider, apiKey }
  Response: { content, usage: { inputTokens, outputTokens } }

POST /api/dev/generate-quiz
  Body: { systemPrompt, userPrompt, provider, apiKey }
  Response: { content, usage }

POST /api/dev/test-connection
  Body: { provider, apiKey }
  Response: { success, message, error? }

GET /api/dev/filesystem?type=categories|subcategories|topics
  Query params: ?category=X&subcategory=Y (if needed)
  Response: [string]
```

---

## Context Providers

```typescript
// LLMSettingsContext
{ settings, updateSettings, testConnection }

// SelectionContext
{ selection, updateSelection, categories, subcategories, topics,
  loadSubcategories, loadTopics }

// GenerationContext
{ state, generateLesson, generateQuiz, saveLesson, saveQuiz }
```

---

## Key Decision Points

| Decision | Choice |
|----------|--------|
| Build exclusion | Tree-shaking via `import.meta.env.DEV` |
| UI location | Embedded route `/learn/dev/generator` |
| Tab count | 4 tabs (Settings, Selection, Lessons, Quizzes) |
| Selection flow | Cascading dropdowns + create-new |
| Lesson/Quiz split | Radio buttons (mutually exclusive) |
| Form type | Unified form with conditional fields |
| Prompt visibility | System hidden, User prompt shown (read-only) |
| Schema in prompt | Included as code block in user prompt |
| Output format | JSON (lessons as .md, quizzes as .json) |
| Versioning | Auto-increment (v1, v2, v3...) |
| LLM pattern | Adapter pattern |
| API key storage | localStorage (no encryption) |
| Connection test | POST endpoint with ✅/❌ feedback |
| Error handling | User choice (retry/fix/view raw) |
| Preview format | Markdown for lessons, JSON for quizzes |

---

## Validation Rules

### Before Accepting Lesson
- [x] title: 5-100 chars
- [x] objectives: 1-10 items (5-200 chars each)
- [x] sections: 1-20 items with title + markdown content
- [x] keyTakeaways: 1-5 items (5-150 chars each)
- [x] metadata fields present and valid

### Before Accepting Quiz
- [x] title: 5-100 chars
- [x] lesson_id: non-empty
- [x] quiz_version: positive integer
- [x] questions: 1+ items
- [x] totalQuestions matches questions.length
- [x] All required fields per question present
- [x] Metadata complete and valid

---

## Error Scenarios & Recovery

```
LLM Response Invalid
├── Parse Error → Show error + offer retry
├── Schema Mismatch → Show what's missing + offer manual fix
└── Question Count Wrong → Show actual vs expected + offer retry

User Clicks "Retry"
├── Regenerate with same prompt
└── Validate again

User Clicks "Manual Fix"
├── Open JSON editor
├── User makes changes
├── Revalidate
└── Save on success

User Clicks "View Raw"
└── Show LLM response as-is
```

---

## localStorage Keys

```javascript
localStorage.dev_llm_settings = {
  provider: 'openRouter',
  isConnected: true,
  lastTestedAt: '2026-11-01T21:00:00Z'
}

localStorage.dev_llm_apikeys = {
  openRouter: 'sk-or-v1-...'
}

localStorage.dev_selection = {
  category: 'Spoken Languages',
  subcategory: 'French',
  topic: 'Greetings',
  type: 'lesson'
}
```

---

## Prompt Template Structure

### Lesson
```
[SYSTEM PROMPT - Hidden]
"You are an expert language instructor..."

[USER PROMPT - Shown in Text Field]
"Create a language lesson with:
Target Age Group: {ageGroup}
Duration: {duration}
Topic: {topic}
Custom Instructions: {customInstructions}

Output Format (JSON Schema):
```json
{schema}
```"
```

### Quiz
```
[SYSTEM PROMPT - Hidden]
"You are an expert in creating language quizzes..."

[USER PROMPT - Shown in Text Field]
"Create a language learning quiz for: {lessonTitle}
Quiz Configuration:
- Easy questions: {easyCount}
- Medium: {mediumCount}
- Hard: {hardCount}
Custom Requirements: {customInstructions}

Output Format (JSON Schema):
```json
{schema}
```"
```

---

## Markdown Support (Lesson Content)

✅ **Supported**
- Headers: `# H1`, `## H2`, `### H3`
- Bold: `**text**`, Italic: `*text*`
- Lists: `- item`, `1. ordered`
- Tables: `| col1 | col2 |`
- Code: ` ```language ... ``` `
- Links: `[text](url)`
- Blockquotes: `> text`

❌ **Not Supported**
- HTML tags
- Images
- CSS
- Custom styling

---

## Implementation Phases (16-24 hours total)

| Phase | Time | What |
|-------|------|------|
| 1 | 1-2h | Setup: files, types, route guard |
| 2 | 4-6h | UI: components, forms, inputs |
| 3 | 2-3h | State: Context, localStorage, hooks |
| 4 | 3-4h | LLM: adapter, OpenRouter, API calls |
| 5 | 2-3h | Validation: schema validators, error handling |
| 6 | 2-3h | File System: read/write, versioning |
| 7 | 2-3h | Integration: wire everything, test, tree-shaking check |

---

## Success Criteria

- [x] Dev code not in production build (tree-shaking verified)
- [x] All 4 tabs functional and connected
- [x] Lesson generation end-to-end working
- [x] Quiz generation end-to-end working
- [x] Files saved to correct locations with versions
- [x] API key persists across sessions
- [x] Connection testing gives accurate feedback
- [x] Error handling offers meaningful recovery options
- [x] Prompt preview shows populated values + schema
- [x] LLM responses validated against schemas

---

## Questions During Implementation?

| Question | Answer Location |
|----------|-----------------|
| How should component X work? | DEV_GENERATOR_COMPONENTS.md |
| What's the complete architecture? | DEV_GENERATOR_ARCHITECTURE.md |
| What should the user see? | DEV_GENERATOR_FLOWS.md |
| What data format? | DEV_GENERATOR_SCHEMAS.md |
| How do I start? | DEV_GENERATOR_INDEX.md |

---

**Keep this page open while implementing!** 📌

Refer to full documentation files for detailed implementation guidance.
