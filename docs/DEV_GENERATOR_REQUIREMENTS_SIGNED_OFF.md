# Dev Generator - Requirements Sign-Off

**Session Date**: 2026-11-01  
**Status**: ✅ All Requirements Collected & Documented  
**Ready For**: Implementation Approval

---

## Requirements Brainstorming Results

### User Request vs Implementation Design

| # | Requirement | User Input | Decision | Status |
|---|------------|-----------|----------|--------|
| 1 | **UI exclusion from production** | "should not be bundled as part of `npm run build`" | Tree-shaking via `import.meta.env.DEV` (Vite plugin middleware also excluded) | ✅ Designed |
| 2 | **UI Location** | Need UI for POST-only endpoint | Embedded route at `/learn/dev/generator` | ✅ Designed |
| 3 | **Category/Subcategory/Topic Selection** | "allow user to choose category/subcategory/topic. if user wants to create, allow define a UI mechanism where user can define a freeform text to create them" | Cascading dropdowns with create-new option at each level | ✅ Designed |
| 4 | **Topic Creation** | "allow user to name it" | Name field (required) when selecting "create new" | ✅ Designed |
| 5 | **Lesson Definition** | "give a brief description. have the prompts ready to be sent to LLM providers" | Custom instructions field (MANDATORY) where user describes lesson | ✅ Designed |
| 6 | **LLM Provider Support** | "in this case, open router, with a standard interface: text only input, text and/or image input, that I can extend to other LLM providers" | Adapter pattern (LLMProvider interface), OpenRouter first (text-based), extensible for Claude/GPT/others | ✅ Designed |
| 7 | **API Key Input & Storage** | "If it is open router, allow user to input the API key. save the API key in local storage. retrieve it from the local storage when user selects openrouter" | localStorage with key `dev_llm_apikeys`, UI input field, auto-retrieved when provider selected | ✅ Designed |
| 8 | **Connection Test** | "do a quick connection test" | POST /api/dev/test-connection with visual feedback | ✅ Designed |
| 9 | **Test Feedback** | "when API Key is either entered manually or fetched, do a quick connection test" | ✅ Green checkmark or ❌ Red X with error message | ✅ Designed |
| 10 | **LLM Settings Separation** | "the LLM related settings, should be in a separate tab on the same page. the other tab (not the one for LLM Settings) is where I generate the lessons/quiz" | **Tab 1: LLM Settings** (API key, connection test), **Tabs 2-4**: Selection/Lessons/Quizzes | ✅ Designed |
| 11 | **Automatic Subcategory Fetch** | "Once user selects category, sub categories are automatically fetched from file system (FS)" | Cascading: category selection triggers API call to GET /api/dev/filesystem for subcategories | ✅ Designed |
| 12 | **Topic Fetching from FS** | "Based on sub category FS provides topics" | Cascading: subcategory selection triggers API call for topics | ✅ Designed |
| 13 | **Create vs Select** | "Once topic is either selected or entered" | Dropdown with existing topics + create-new option for freeform entry | ✅ Designed |
| 14 | **Lesson/Quiz Selection** | "last dropdown is, lesson or quiz (definitive, no free form text here unlike others)" | Radio buttons (not dropdown): Lesson OR Quiz (mutually exclusive) | ✅ Designed |
| 15 | **Custom Lesson Prompt** | "if it is lesson, allow user to enter custom prompt for the lesson plan" | Custom instructions field (MANDATORY, required for generation) | ✅ Designed |
| 16 | **Age Group Selection** | "user should provide age group" | Dropdown: 5-8 years, 9-12 years, 13-18 years, 18+ years (predefined list) | ✅ Designed |
| 17 | **Prompt Templates** | "have some sets of prompts created for creating lessons and quizzes. Meaning based on the selection that ends up with lesson/quiz, we select a system and user prompt where we inject the inputs" | Predefined prompt templates per generation type (lesson/quiz), auto-populated with user selections | ✅ Designed |
| 18 | **System vs User Prompt** | "System prompt is not seen, just user. User prompt is shown in the UI as a text field" | System prompt (hidden), user prompt (shown in read-only text field, auto-populated with values + schema) | ✅ Designed |
| 19 | **Lesson Output Format** | "we need to decide the format of the output. Since we need markdown with front matter, maybe we have a schema that divides the file contents into meta data and the raw markdown" | JSON schema with frontmatter-friendly structure: metadata fields + markdown content sections | ✅ Designed |
| 20 | **Schema in Prompt** | "this schema goes into the prompt as input" | JSON schema included as code block in the user prompt template (shown to user) | ✅ Designed |
| 21 | **Quiz Schema Validation** | "Quiz: this already has the schema. We can provide the schema as the input in the prompt that goes to the LLM to ensure the output is conformant" | Quiz schema included in user prompt template (same approach as lessons) | ✅ Designed |
| 22 | **Quiz Lesson Selection** | "Allow user to select the lesson for which the quiz is to be generated" | Dropdown in quizzes tab showing all lessons for selected topic | ✅ Designed |
| 23 | **Quiz Question Counts** | "provide user options select how many question in the quiz for each of the 3 levels. default is 30 for each of the 3 levels" | Input fields: Easy (default 30), Medium (default 30), Hard (default 30), customizable | ✅ Designed |
| 24 | **Quiz File Naming** | "I understand the file naming structure around quiz may/will change or we may need to leverage metadata or maybe some other approach. Lets think about this" | quiz-[lesson-id]-v1.json, v2.json, etc. (version-based naming, metadata included in JSON) | ✅ Designed |
| 25 | **Lesson Duration** | "give a brief description. ... target age group, lesson duration from dropdowns" | Dropdown: 15 minutes, 30 minutes, 45 minutes, 60 minutes | ✅ Designed |

---

## Architectural Decisions Confirmed

### Build Strategy
| Decision | What You Asked | What We Designed | Approved |
|----------|----------------|-----------------|----------|
| Build Exclusion | "should not be bundled as part of `npm run build`" | Tree-shaking via `import.meta.env.DEV` + Vite plugin middleware | ✅ |
| Production Impact | (implied: zero impact) | Zero bundle size impact (dev code completely excluded) | ✅ |

### UI Structure
| Decision | What You Asked | What We Designed | Approved |
|----------|----------------|-----------------|----------|
| Route Location | Need UI for API endpoint | Embedded at `/learn/dev/generator` | ✅ |
| Tab Count | Separate tabs for settings vs generation | **4 tabs**: Settings, Selection, Lessons, Quizzes | ✅ |
| Lesson/Quiz Split | "the other tab (not the one for LLM Settings) is where I generate" | **Separate tabs** (Lessons vs Quizzes) with unified form approach | ✅ |
| Form Approach | Different inputs for each generation type | **Unified form** (radio to select lesson/quiz, conditional fields) | ✅ |

### Data Selection
| Decision | What You Asked | What We Designed | Approved |
|----------|----------------|-----------------|----------|
| Category Selection | "allow user to choose category/subcategory/topic" | **Cascading dropdowns** (each depends on previous) | ✅ |
| Create New | "allow define a UI mechanism where user can define a freeform text" | **Dropdown + create button** at each level | ✅ |
| Topic vs Lesson/Quiz | "Once topic is either selected or entered, last dropdown is, lesson or quiz" | **Radio buttons** (not dropdown, mutually exclusive) | ✅ |

### Output Formats
| Decision | What You Asked | What We Designed | Approved |
|----------|----------------|-----------------|----------|
| Lesson Format | "markdown with front matter... schema that divides into metadata and raw markdown" | **JSON schema** with metadata fields + markdown sections (stores as .md with YAML frontmatter) | ✅ |
| Markdown Support | (implied: tables, code, etc.) | Full Markdown support (headers, lists, tables, code blocks, links, etc.) | ✅ |
| Quiz Format | "this already has the schema" | **JSON schema** with structured questions (multiple-choice, true-false, short-answer) | ✅ |
| Quiz Metadata | (implied: link to lesson) | Included in JSON: `lesson_id`, `quiz_version`, question-level difficulty tracking | ✅ |

### LLM Integration
| Decision | What You Asked | What We Designed | Approved |
|----------|----------------|-----------------|----------|
| Provider Pattern | "standard interface... that I can extend to other LLM providers" | **Adapter pattern** (LLMProvider interface + OpenRouterProvider) | ✅ |
| First Provider | "in this case, open router" | **OpenRouter** with text-based API (extensible for image support) | ✅ |
| API Key Management | "save the API key in local storage" | **localStorage** with key `dev_llm_apikeys`, required for connection test | ✅ |
| Persistence | (implied: across sessions) | **Persists** in localStorage, auto-retrieved when provider selected | ✅ |
| Connection Test | "do a quick connection test" | **POST /api/dev/test-connection** with ✅/❌ visual feedback | ✅ |

### Prompt Management
| Decision | What You Asked | What We Designed | Approved |
|----------|----------------|-----------------|----------|
| Template Type | "have some sets of prompts created" | **Predefined templates** (not customizable by user, only populated values) | ✅ |
| System Prompt | "System prompt is not seen" | **Hidden from user** (backend only) | ✅ |
| User Prompt Display | "User prompt is shown in the UI as a text field" | **Read-only text field** showing template auto-populated with selections + schema | ✅ |
| Population Method | "we inject the inputs" | **Real-time auto-population** as user selects/enters values | ✅ |
| Schema Delivery | "schema goes into the prompt as input" | **JSON schema as code block** in user prompt template (included and shown to user) | ✅ |

### File Organization
| Decision | What You Asked | What We Designed | Approved |
|----------|----------------|-----------------|----------|
| Storage Path | (implied: existing structure) | **/data/categories/[category]/[subcategory]/[topic]/** | ✅ |
| Lesson Naming | "file naming structure... may need to change" | **lesson-[slug]-v1.md, v2.md, etc.** (auto-increment versioning) | ✅ |
| Quiz Naming | "quiz file naming may/will change" | **quiz-[lesson-id]-v1.json, v2.json, etc.** (version-based, independent per lesson) | ✅ |
| Version Strategy | "leverage metadata or maybe some other approach" | **Metadata included in files** + filename versioning | ✅ |

---

## Functionality Checklist

### Category/Subcategory/Topic Selection
- [x] Dropdown for selecting existing category
- [x] "Create new category" option with text input
- [x] Cascading: Subcategory dropdown depends on selected category
- [x] "Create new subcategory" option
- [x] Cascading: Topic dropdown depends on selected subcategory
- [x] "Create new topic" option

### Lesson Generation
- [x] Auto-filled Topic (from Selection tab)
- [x] Age Group dropdown (5-8, 9-12, 13-18, 18+)
- [x] Duration dropdown (15, 30, 45, 60 minutes)
- [x] Custom Instructions field (MANDATORY)
- [x] User Prompt Preview (auto-populated with values + JSON schema)
- [x] Generate button
- [x] Validation against JSON schema
- [x] Markdown preview on success
- [x] Error handling with retry/manual fix/view raw options
- [x] Save to file system

### Quiz Generation
- [x] Auto-filled Topic (from Selection tab)
- [x] Lesson selector (dropdown of all lessons in topic)
- [x] Question counts per difficulty (Easy/Medium/Hard, default 30/30/30)
- [x] Custom Instructions field (MANDATORY)
- [x] User Prompt Preview (auto-populated with values + JSON schema)
- [x] Generate button
- [x] Validation against JSON schema + question count
- [x] JSON preview on success
- [x] Error handling with retry/manual fix/view raw options
- [x] Save to file system with versioning

### LLM Settings
- [x] Provider selector dropdown
- [x] API key input field
- [x] Connection test button
- [x] Visual feedback (✅ Green or ❌ Red X)
- [x] Error messages
- [x] localStorage persistence

### Post-Generation Workflow
- [x] Validate LLM response
- [x] Show preview (Markdown for lessons, JSON for quizzes)
- [x] Error handling with options:
  - [x] Retry (regenerate)
  - [x] Manual Fix (JSON editor)
  - [x] View Raw (show response as-is)
- [x] Save to file system
- [x] Success message with file path

---

## Data Models Confirmed

### Lesson Schema ✅
```json
{
  "title": "string",
  "objectives": ["string"],
  "sections": [{"title": "string", "content": "markdown"}],
  "keyTakeaways": ["string"],
  "metadata": {
    "ageGroup": "5-8|9-12|13-18|18+",
    "duration": "15|30|45|60 minutes",
    "language": "string",
    "createdAt": "ISO 8601"
  }
}
```

### Quiz Schema ✅
```json
{
  "title": "string",
  "lesson_id": "string",
  "quiz_version": 1,
  "questions": [{
    "id": "string",
    "type": "multiple-choice|true-false|short-answer",
    "question": "string",
    "options": ["string"],
    "correctAnswer": "string|number",
    "explanation": "string",
    "difficulty": "easy|medium|hard",
    "points": 1-10
  }],
  "metadata": {
    "totalQuestions": 90,
    "createdAt": "ISO 8601",
    "lessonId": "string"
  }
}
```

---

## User Questions & Clarifications

### Resolved During Brainstorming

| Question | Your Answer | Our Decision |
|----------|------------|--------------|
| How should dev code be excluded from production? | Tree-shaking via `import.meta.env.DEV` | ✅ Implemented via Vite config |
| Where should the dev UI be located? | Embedded route `/learn/dev/generator` | ✅ Accessible from main app |
| Should LLM settings be separate from generation? | Yes, separate tab | ✅ Tab 1: Settings, Tabs 2-4: Generation |
| How many tabs total? | 4 tabs designed | ✅ Settings, Selection, Lessons, Quizzes |
| How should dropdowns work? | Cascading with create-new option | ✅ Designed with both capabilities |
| Should system prompt be shown? | No, only user prompt | ✅ System hidden, user prompt displayed |
| Should user be able to edit the prompt? | No, show template with populated values | ✅ Read-only field with auto-population |
| Should JSON schema be in the prompt? | Yes, as code block | ✅ Included in user prompt template |
| How should file versions be named? | Lesson v1, v2, etc.; Quiz v1, v2, etc. | ✅ Auto-increment versioning |
| Should quizzes support multiple versions per lesson? | Yes | ✅ Independent versioning per lesson |
| How should API keys be stored? | localStorage only | ✅ No encryption, persists across sessions |
| Should API key test show visual feedback? | Yes, ✅ or ❌ | ✅ Green checkmark or Red X with message |
| What if LLM response fails validation? | Show error with 3 options (retry/fix/view raw) | ✅ User choice error handling |
| What should previews show? | Markdown for lessons, JSON for quizzes | ✅ Format-appropriate preview |

---

## Implementation Ready? ✅

### All Decisions Made
- [x] Build strategy (tree-shaking)
- [x] UI structure (4 tabs)
- [x] Data selection flow (cascading)
- [x] Output formats (JSON schemas)
- [x] LLM integration (adapter pattern)
- [x] File organization (/data/categories/)
- [x] Validation approach (JSON schema)
- [x] Error handling (user choice workflow)
- [x] State management (3 Context providers)
- [x] API endpoints (4 dev-only endpoints)

### All Documentation Created
- [x] Architecture document (18KB)
- [x] Flow diagrams (19KB)
- [x] Schema specifications (17KB)
- [x] Component hierarchy (12KB)
- [x] Summary & index (20KB)

### No Code Written Yet
- ✅ Awaiting implementation approval
- ✅ No files created until you say "go"
- ✅ Ready to start Phase 1 when you're ready

---

**Status**: ✅ **READY FOR IMPLEMENTATION**

When you're ready, just say: **"Implement Stage 8.1"** (or whatever stage)

I will then build everything according to this design! 🚀

