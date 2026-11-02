# Dev Generator Documentation Index

## Overview
Complete brainstorming and architecture documentation for the dev-only lesson/quiz generator feature.

**Status**: ✅ Brainstorming complete. All requirements documented. Ready for implementation.

---

## 📋 Documentation Files

### 1. **DEV_GENERATOR_SUMMARY.md**
**Start here!** Quick overview of all decisions and requirements.
- What we planned
- Key architecture decisions
- Requirements summary
- User experience flow (end-to-end)
- Next steps for implementation

**Read time**: 10 minutes

---

### 2. **DEV_GENERATOR_ARCHITECTURE.md** 
Comprehensive technical architecture and design specifications.

**Sections**:
- Build & Deployment Strategy (tree-shaking, file structure)
- UI Layout & Navigation (4 tabs, form structure, flows)
- LLM Provider Architecture (adapter pattern, OpenRouter implementation)
- Data Model & File Organization (lesson/quiz schemas, file storage)
- Post-Generation Workflow (preview → save, error handling)
- Prompt Templates (system + user prompt structure)
- API Endpoints (dev-only endpoints for LLM, filesystem, connection testing)
- Data Validation & Error Handling
- State Management (Context providers, localStorage keys)
- Future Enhancements
- Testing Strategy
- Implementation Checklist

**When to use**: Building components, implementing API endpoints, designing error handling

**Read time**: 30 minutes

---

### 3. **DEV_GENERATOR_FLOWS.md**
Visual diagrams and flowcharts for all major workflows.

**Diagrams**:
1. Overall application flow (4 tabs overview)
2. LLM Settings → Connection test flow (with ✅/❌ feedback)
3. Selection tab → Cascading dropdowns flow
4. Lessons tab → Generation flow (form → prompt → LLM → validate → preview → save)
5. Quizzes tab → Generation flow
6. File system structure after generation
7. Data flow: LLM provider to file system
8. API key lifecycle (localStorage, persistence, validation)

**When to use**: Understanding user interactions, presenting to stakeholders, debugging flows

**Read time**: 20 minutes

---

### 4. **DEV_GENERATOR_SCHEMAS.md**
Detailed JSON schemas, TypeScript interfaces, and validation rules.

**Sections**:
- Lesson Output Schema (JSON Schema, TypeScript interface, example output)
- Lesson Markdown content capabilities (supported elements, examples)
- Quiz Output Schema (JSON Schema, TypeScript interface, example output)
- Question Type Details (multiple-choice, true-false, short-answer)
- Difficulty Distribution (easy/medium/hard %)
- File Naming & Versioning rules
- Markdown Content Guidelines (what's supported, what's not)
- Validation Checklist (before accepting lesson/quiz)

**When to use**: Validating LLM responses, implementing validators, understanding expected formats

**Read time**: 25 minutes

---

### 5. **DEV_GENERATOR_COMPONENTS.md**
Component hierarchy, structure, and implementation details.

**Sections**:
- Component Structure (tree view of all components)
- Component Details (purpose, props, state, features for each)
- Context Providers (LLMSettingsContext, SelectionContext, GenerationContext)
- Data Flow Diagram
- Styling & UI Components (Tailwind, shadcn/ui patterns)
- Error Boundaries
- Custom Hooks (useLessonPrompt, useQuizPrompt, useOpenRouter, useFileSystem)
- Accessibility (a11y) considerations
- Performance considerations

**When to use**: Building React components, understanding state flow, implementing hooks

**Read time**: 20 minutes

---

## 🎯 Quick Reference

### Architecture at a Glance
```
Feature:         Dev-only lesson/quiz generator
Status:          Designed, ready for implementation
Build:           Tree-shaking via import.meta.env.DEV (zero bundle impact)
Location:        /learn/dev/generator (embedded route)
UI:              4 tabs (LLM Settings, Selection, Lessons, Quizzes)
LLM:             OpenRouter (adapter pattern for future providers)
Storage:         File system (/data/categories/) + localStorage (API keys)
Persistence:     Settings across sessions, lessons/quizzes to files
```

### Key Requirements Checklist
- [x] Embedded route at `/learn/dev/generator`
- [x] 4-tab layout designed
- [x] Cascading category/subcategory/topic selection with create-new
- [x] Lesson generation with age group + duration + custom instructions
- [x] Quiz generation with question count customization (30/30/30 default)
- [x] OpenRouter integration with API key management
- [x] Connection testing (✅/❌ feedback)
- [x] Live user prompt preview with populated values + JSON schema
- [x] JSON schema validation for lessons and quizzes
- [x] Markdown content support for lessons
- [x] Preview before save
- [x] Error handling with retry/manual fix options
- [x] localStorage persistence
- [x] Tree-shaking for production build
- [x] File system organization designed
- [x] Adapter pattern for extensibility

### File Structure
```
/src/routes/dev/
  ├── index.tsx              # Route entry (DEV check)
  ├── DeveloperGenerator.tsx  # Root + contexts
  ├── tabs/
  │   ├── LLMSettings.tsx    # API key + connection test
  │   ├── Selection.tsx      # Cascading dropdowns
  │   ├── Lessons.tsx        # Lesson generation
  │   └── Quizzes.tsx        # Quiz generation
  ├── hooks/
  │   ├── useLessonPrompt.ts
  │   ├── useQuizPrompt.ts
  │   ├── useOpenRouter.ts
  │   └── useFileSystem.ts
  └── types/
      ├── lesson.ts
      └── quiz.ts

/src/services/llm/
  ├── providers/
  │   ├── LLMProvider.interface.ts
  │   ├── OpenRouterProvider.ts
  │   └── index.ts
  └── prompts/
      ├── lessonPrompts.ts
      └── quizPrompts.ts
```

### API Endpoints (Dev-only, excluded from production)
```
POST /api/dev/generate-lesson       → LLM lesson generation
POST /api/dev/generate-quiz         → LLM quiz generation
POST /api/dev/test-connection       → Test LLM API key
GET  /api/dev/filesystem            → Read file system structure
```

### Lesson Schema (JSON)
```json
{
  "title": "string",
  "objectives": ["string[]"],
  "sections": [{"title": "string", "content": "markdown"}],
  "keyTakeaways": ["string[]"],
  "metadata": {
    "ageGroup": "5-8|9-12|13-18|18+",
    "duration": "15|30|45|60 minutes",
    "language": "string",
    "createdAt": "ISO 8601"
  }
}
```

### Quiz Schema (JSON)
```json
{
  "title": "string",
  "lesson_id": "string",
  "quiz_version": 1,
  "questions": [{
    "id": "string",
    "type": "multiple-choice|true-false|short-answer",
    "question": "string",
    "options": ["string[]"],
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

### User Experience (End-to-End)
```
1. User navigates to /learn/dev/generator
2. LLM Settings tab → Enter OpenRouter API key → Test connection (✅)
3. Selection tab → Choose Category/Subcategory/Topic/Type (Lesson or Quiz)
4. Lessons/Quizzes tab → Fill form (age, duration, instructions, etc.)
5. User prompt preview updates with populated values + JSON schema
6. Click "Generate" → API call to OpenRouter
7. Response validated against JSON schema
8. Preview shown (Markdown for lessons, JSON for quizzes)
9. User clicks "Save" → Written to /data/categories/...
10. Success message with file path
```

---

## 🚀 Implementation Path

When ready to implement, follow this order:

1. **Phase 1: Setup** (1-2 hours)
   - Create file structure
   - Create TypeScript types and interfaces
   - Setup route with DEV guard
   
2. **Phase 2: UI Components** (4-6 hours)
   - Build DeveloperGenerator root component
   - Create 4 tab components
   - Create form components (inputs, dropdowns)
   - Create preview components
   
3. **Phase 3: State Management** (2-3 hours)
   - Create 3 Context providers
   - Implement localStorage persistence
   - Create custom hooks for prompts and API
   
4. **Phase 4: LLM Integration** (3-4 hours)
   - Implement LLMProvider adapter interface
   - Implement OpenRouterProvider
   - Create prompt template functions
   - Add API endpoints to Vite config
   
5. **Phase 5: Validators** (2-3 hours)
   - Implement Lesson validator (JSON schema)
   - Implement Quiz validator (JSON schema + question count)
   - Add error handling and user feedback
   
6. **Phase 6: File System** (2-3 hours)
   - Implement file read operations (categories/subcategories/topics)
   - Implement file write operations (save lessons/quizzes)
   - Handle versioning logic
   
7. **Phase 7: Integration & Testing** (2-3 hours)
   - Wire up all components together
   - Test end-to-end workflows
   - Verify tree-shaking (no dev code in prod build)
   - Test error scenarios and recovery
   
**Total estimated time**: 16-24 hours of development

---

## 📚 How to Use This Documentation

### For Product Managers / Stakeholders
👉 Read: **DEV_GENERATOR_SUMMARY.md** + **DEV_GENERATOR_FLOWS.md**
- Get quick overview
- See visual flows
- Understand user experience

### For Developers (Building UI)
👉 Read: **DEV_GENERATOR_COMPONENTS.md** + **DEV_GENERATOR_ARCHITECTURE.md** (UI sections)
- Component structure and hierarchy
- Form layouts and state management
- Data flow and props

### For Developers (Building Backend/API)
👉 Read: **DEV_GENERATOR_ARCHITECTURE.md** (API sections) + **DEV_GENERATOR_SCHEMAS.md**
- API endpoints and contracts
- Schema definitions and validation
- File storage organization

### For Developers (Full Implementation)
👉 Read in order:
1. **DEV_GENERATOR_SUMMARY.md** (overview)
2. **DEV_GENERATOR_ARCHITECTURE.md** (complete technical design)
3. **DEV_GENERATOR_SCHEMAS.md** (data formats)
4. **DEV_GENERATOR_COMPONENTS.md** (code structure)
5. **DEV_GENERATOR_FLOWS.md** (visual reference)

### For Code Review / QA
👉 Read: **DEV_GENERATOR_ARCHITECTURE.md** (implementation checklist) + **DEV_GENERATOR_SCHEMAS.md** (validation rules)
- Verification checklist
- Expected behavior
- Error scenarios

---

## ❓ Questions During Implementation?

### "How should I handle X?"
→ Check **DEV_GENERATOR_ARCHITECTURE.md** (detailed architecture)

### "What should component Y look like?"
→ Check **DEV_GENERATOR_COMPONENTS.md** (component details)

### "What's the expected output format?"
→ Check **DEV_GENERATOR_SCHEMAS.md** (schemas + examples)

### "How should the user flow work?"
→ Check **DEV_GENERATOR_FLOWS.md** (user journey diagrams)

### "What are the requirements again?"
→ Check **DEV_GENERATOR_SUMMARY.md** (checklist)

---

## ✅ Approval Gate

Before implementing, confirm:
- [ ] All architecture decisions align with project vision
- [ ] Tree-shaking approach approved (no dev code in prod build)
- [ ] File storage structure approved
- [ ] LLM provider integration approach approved
- [ ] UI/UX mockups or layouts are acceptable
- [ ] Team ready to start implementation

**Status**: ✅ Ready for approval. All documentation complete.

---

**Next step**: Implementation approval → Build Phase 1 (Setup)
