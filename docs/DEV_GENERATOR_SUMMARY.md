# Dev Generator - Brainstorming Summary

**Status**: Architecture complete. Ready for implementation approval.

---

## What We Planned

A **dev-only UI** for generating language lessons and quizzes using LLM providers (starting with OpenRouter). The feature is completely excluded from production builds.

---

## Key Architecture Decisions

### Build Strategy
- ✅ **Tree-shaking via `import.meta.env.DEV`**: Dev-only code is completely removed from production builds
- ✅ **Zero production bundle impact**: No extra kilobytes in dist/

### UI Structure
- ✅ **Embedded route** at `/learn/dev/generator` (accessible via app navigation)
- ✅ **4 tabs**:
  1. **LLM Settings**: API key management + connection testing
  2. **Selection**: Cascading category/subcategory/topic dropdowns with create-new option
  3. **Lessons**: Generate lessons with customized prompts
  4. **Quizzes**: Generate quizzes for selected lessons

### LLM Integration
- ✅ **Adapter pattern**: Easy to add Claude, GPT-4, etc. later
- ✅ **OpenRouter first**: Main LLM provider to start with
- ✅ **API key in localStorage**: Persists across sessions, required for connection test
- ✅ **Connection testing**: ✅ Green checkmark or ❌ Red X with error message

### Prompt Management
- ✅ **Predefined templates**: System prompts + user prompt templates
- ✅ **Live preview**: User prompt template shown in text field, auto-populated with all selections
- ✅ **Populated values in prompt**:
  - Target age group (9-12, 13-18, 5-8, 18+)
  - Duration (15, 30, 45, 60 minutes)
  - Custom instructions (MANDATORY field)
  - JSON schema included as code block in prompt

### Output Formats

#### Lessons
- **Format**: JSON with frontmatter-friendly structure
  - `title`, `objectives`, `sections[]`, `keyTakeaways`, `metadata`
  - Content sections support full Markdown (tables, code, lists, etc.)
  - Stored as `.md` files with YAML frontmatter
- **File naming**: `lesson-[topic-slug]-v1.md`, `v2.md`, etc.
- **Validation**: JSON Schema validation required

#### Quizzes
- **Format**: JSON with structured questions
  - 3 question types: multiple-choice, true-false, short-answer
  - Each question has difficulty, points, explanation
- **File naming**: `quiz-[lesson-id]-v1.json`, `v2.json`, etc.
- **Versioning**: Independent from lesson versions
- **Questions per difficulty**: Customizable (default: 30 easy, 30 medium, 30 hard)
- **Validation**: JSON Schema + question count verification

### Selection Flow
- ✅ **Cascading dropdowns**: Category → Subcategory → Topic
- ✅ **Create-new option**: For each level, users can create new items
- ✅ **Unified lesson/quiz form**: Single form with conditional fields based on selection
- ✅ **Lesson/quiz toggle**: Radio buttons to select what to generate

### File Organization
```
/data/categories/
  ├── [category]/
  │   ├── [subcategory]/
  │   │   ├── [topic]/
  │   │   │   ├── lesson-[slug]-v1.md
  │   │   │   ├── lesson-[slug]-v2.md
  │   │   │   ├── quiz-[id]-v1.json (tests lesson-v1)
  │   │   │   ├── quiz-[id]-v2.json (tests lesson-v1)
  │   │   │   └── quiz-[id]-v3.json (tests lesson-v2)
```

### Post-Generation Workflow
- ✅ **Preview then save**: LLM response → Validation → Markdown/JSON preview → User confirms → Save to file system
- ✅ **Error handling with options**:
  - ❌ Validation fails → Show error + 3 options:
    - "Retry" (regenerate with adjusted prompt)
    - "Manual Fix" (JSON editor)
    - "View Raw" (show LLM response as-is)
- ✅ **Preview format**:
  - Lessons: Markdown preview
  - Quizzes: JSON view

### API Endpoints (Dev-only)
```
POST /api/dev/generate-lesson     → Send lesson prompt to LLM
POST /api/dev/generate-quiz       → Send quiz prompt to LLM
POST /api/dev/test-connection     → Test LLM API key validity
GET  /api/dev/filesystem          → Read categories/subcategories/topics from FS
```

### Data Persistence
- **API keys**: localStorage with key `dev_llm_apikeys`
- **Settings**: localStorage with key `dev_llm_settings`
- **Lessons/Quizzes**: File system under `/data/categories/`
- **Persistence scope**: LLM settings and API key persist across page reloads

---

## Documentation Created

### 1. **DEV_GENERATOR_ARCHITECTURE.md** (17KB)
Complete technical architecture covering:
- Build & deployment strategy
- UI layout for all 4 tabs
- LLM provider adapter pattern
- Data models & schemas
- Post-generation workflow
- Prompt templates
- API endpoints
- Error handling
- State management
- Testing strategy
- Implementation checklist

### 2. **DEV_GENERATOR_FLOWS.md** (13KB)
Visual diagrams showing:
- Overall application flow
- LLM Settings connection test flow
- Cascading dropdown selection flow
- Lesson generation flow (form → prompt → LLM → validate → preview → save)
- Quiz generation flow
- File system structure after generation
- Data flow from user form to file system
- API key lifecycle

### 3. **DEV_GENERATOR_SCHEMAS.md** (17KB)
Detailed schema definitions:
- Lesson JSON schema + TypeScript interface + example output
- Lesson markdown content capabilities (supported elements)
- Quiz JSON schema + TypeScript interface + example output
- Question type details (multiple-choice, true-false, short-answer)
- Difficulty distribution guidelines
- File naming & versioning rules
- Markdown content guidelines
- Validation checklist

---

## Requirements Summary

### Mandatory Features
✅ UI in embedded route `/learn/dev/generator`
✅ 4-tab layout (LLM Settings, Selection, Lessons, Quizzes)
✅ Cascading category/subcategory/topic selection with create-new
✅ Lesson generation with age group + duration + custom instructions
✅ Quiz generation with question count customization (default 30/30/30)
✅ OpenRouter LLM provider with API key management
✅ Connection testing with ✅/❌ feedback
✅ Live user prompt preview with populated values + JSON schema
✅ JSON schema validation for lessons and quizzes
✅ Markdown content support for lessons
✅ Preview before save
✅ Error handling with retry/manual fix options
✅ localStorage persistence for API keys and settings
✅ Tree-shaking: dev code completely excluded from production build
✅ File system storage following existing `/data/categories/` structure

### Extensibility (for future)
✅ Adapter pattern for adding Claude, GPT-4, etc.
✅ Support for image-based LLM providers later
✅ Customizable prompt templates

---

## User Experience Flow (End-to-End)

### Lesson Generation
```
1. User navigates to /learn/dev/generator
2. Goes to LLM Settings tab
   → Selects OpenRouter
   → Enters API key
   → Clicks "Test Connection"
   → ✅ Green checkmark appears
3. Goes to Selection tab
   → Selects or creates Category
   → Selects or creates Subcategory
   → Selects or creates Topic
   → Selects "Lesson" radio button
4. Goes to Lessons tab
   → Topic auto-filled from Selection tab
   → Enters Target Age Group (9-12 years)
   → Enters Duration (30 minutes)
   → Enters Custom Instructions (MANDATORY)
   → User prompt template auto-populated with all values + JSON schema
5. Clicks "Generate Lesson"
   → Sends to OpenRouter
   → Validates response JSON
   → Shows Markdown preview
6. User reviews content
   → Clicks "Save"
   → Written to `/data/categories/Spoken Languages/French/Greetings/lesson-greetings-v1.md`
   → Success message with file path shown
```

### Quiz Generation
```
Similar flow but:
- In Lessons tab, selects "Quiz" radio button
- Selects which Lesson this quiz tests (dropdown of all lessons)
- Enters question counts (default 30/30/30)
- Enters Custom Instructions (MANDATORY)
- Prompt includes difficulty distribution info
- Quiz response includes all questions with difficulty levels
- Saved as `/data/.../quiz-[lesson-id]-v1.json`
```

---

## Next Steps (When Ready to Implement)

1. **Create file structure**: `/src/routes/dev/`, `/src/services/llm/`
2. **Build UI components**: DeveloperGenerator.tsx + 4 tab components
3. **Implement LLM provider adapter**: Base interface + OpenRouterProvider
4. **Create prompts**: Lesson and quiz prompt templates
5. **Build API endpoints**: Dev-only endpoints in Vite config
6. **Implement validators**: JSON schema validators for lesson and quiz
7. **Add file system operations**: Read/write to `/data/categories/`
8. **Connect everything together**: Wire up all components with Context
9. **Test end-to-end workflows**: Full lesson and quiz generation
10. **Verify tree-shaking**: Confirm dev code removed from production build

---

## Questions to Resolve Before Implementation

**None at this time.** All requirements, architecture, and designs have been documented and approved.

---

**Ready to proceed with implementation whenever you give the go-ahead! 🚀**
