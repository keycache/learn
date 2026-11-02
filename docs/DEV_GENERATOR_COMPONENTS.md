# Dev Generator - Component Hierarchy

## Component Structure

```
DeveloperGenerator.tsx (Root)
├── Context Providers
│   ├── LLMSettingsContext
│   ├── SelectionContext
│   └── GenerationContext
│
├── Tabs Navigation (TabsComponent)
│   ├── Tab 1: LLM Settings
│   │   └── LLMSettings.tsx
│   │       ├── ProviderSelector
│   │       ├── ApiKeyInput
│   │       └── ConnectionTester
│   │
│   ├── Tab 2: Selection
│   │   └── Selection.tsx
│   │       ├── CategorySelector
│   │       │   ├── Dropdown
│   │       │   └── CreateNewButton
│   │       ├── SubcategorySelector
│   │       │   ├── Dropdown (cascading)
│   │       │   └── CreateNewButton
│   │       ├── TopicSelector
│   │       │   ├── Dropdown (cascading)
│   │       │   └── CreateNewButton
│   │       └── TypeSelector
│   │           ├── Radio: Lesson
│   │           └── Radio: Quiz
│   │
│   ├── Tab 3: Lessons
│   │   └── Lessons.tsx
│   │       ├── LessonForm
│   │       │   ├── TopicDisplay (auto-filled)
│   │       │   ├── AgeGroupSelector
│   │       │   ├── DurationSelector
│   │       │   ├── CustomInstructionsTextarea
│   │       │   └── GenerateButton
│   │       ├── PromptPreview
│   │       │   └── UserPromptTemplate (read-only with populated values + schema)
│   │       └── GenerationState
│   │           ├── LoadingIndicator
│   │           ├── ValidationResults
│   │           └── Preview
│   │               ├── MarkdownPreview (on success)
│   │               ├── ErrorDisplay (on failure)
│   │               │   ├── RetryButton
│   │               │   ├── ManualFixButton
│   │               │   └── ViewRawButton
│   │               └── SaveButton
│   │
│   └── Tab 4: Quizzes
│       └── Quizzes.tsx
│           ├── QuizForm
│           │   ├── TopicDisplay (auto-filled)
│           │   ├── LessonSelector (dropdown of lessons in topic)
│           │   ├── QuestionsPerLevel
│           │   │   ├── EasyInput (default 30)
│           │   │   ├── MediumInput (default 30)
│           │   │   ├── HardInput (default 30)
│           │   │   └── TotalDisplay (auto-calculated)
│           │   ├── CustomInstructionsTextarea
│           │   └── GenerateButton
│           ├── PromptPreview
│           │   └── UserPromptTemplate (read-only with populated values + schema)
│           └── GenerationState
│               ├── LoadingIndicator
│               ├── ValidationResults
│               └── Preview
│                   ├── JSONPreview (on success)
│                   ├── ErrorDisplay (on failure)
│                   │   ├── RetryButton
│                   │   ├── ManualFixButton
│                   │   └── ViewRawButton
│                   └── SaveButton
```

---

## Component Details

### DeveloperGenerator.tsx (Root)
**Purpose**: Root component that manages routing, contexts, and tab navigation

**Props**: None (dev route)

**State**: 
- Active tab index
- LLM Settings (provider, API key, connection status)
- Selection (category, subcategory, topic, type)
- Generation (loading, error, result)

**Key Features**:
- Route guard: Only accessible when `import.meta.env.DEV === true`
- Provides 3 contexts to all tabs
- Manages tab navigation
- Persists settings to localStorage

---

### LLMSettings.tsx (Tab 1)
**Purpose**: Configure LLM provider and API key

**Props**: 
- `onSettingsChange: (settings: LLMSettings) => void`

**State**:
- Selected provider
- API key input value
- Connection status (idle, testing, connected, failed)
- Error message (if failed)

**Key Features**:
- Provider dropdown with extensible list
- Secure API key input
- Connection test button with spinner
- Visual feedback: ✅ Green / ❌ Red X
- Save to localStorage on success

**Sub-components**:
- `ProviderSelector`: Dropdown with list of providers
- `ApiKeyInput`: Masked input field
- `ConnectionTester`: Test button + status display

---

### Selection.tsx (Tab 2)
**Purpose**: Select or create category/subcategory/topic

**Props**:
- `onSelectionChange: (selection: Selection) => void`

**State**:
- Category value
- Subcategory value
- Topic value
- Generation type (lesson or quiz)
- Available options for each level (loaded from file system)

**Key Features**:
- Cascading dropdowns (each level depends on previous)
- Create new option for each level
- Auto-fetch available options via API call
- Update contexts when selections change

**Sub-components**:
- `CategorySelector`: Dropdown + create button
- `SubcategorySelector`: Cascading dropdown + create button
- `TopicSelector`: Cascading dropdown + create button
- `TypeSelector`: Radio buttons (Lesson vs Quiz)

---

### Lessons.tsx (Tab 3)
**Purpose**: Generate lessons with LLM

**Props**:
- `selectedTopic: string` (from Selection context)
- `llmSettings: LLMSettings` (from LLM Settings context)

**State**:
- Age group selection
- Duration selection
- Custom instructions input
- Generated lesson (or error)
- Validation state

**Key Features**:
- Form auto-populates from context
- Prompt preview updates in real-time
- Shows populated user prompt + JSON schema
- Generates lesson via API
- Validates response against schema
- Shows Markdown preview on success
- Error handling with retry/manual fix options
- Saves to file system

**Sub-components**:
- `LessonForm`: Form inputs
- `PromptPreview`: Read-only prompt display
- `MarkdownPreview`: Rendered markdown content
- `ErrorDisplay`: Error message + retry options
- `SaveButton`: Save to file system

---

### Quizzes.tsx (Tab 4)
**Purpose**: Generate quizzes with LLM

**Props**:
- `selectedTopic: string` (from Selection context)
- `llmSettings: LLMSettings` (from LLM Settings context)

**State**:
- Lesson selection (dropdown)
- Easy/medium/hard question counts
- Custom instructions input
- Generated quiz (or error)
- Validation state

**Key Features**:
- Topic auto-filled from context
- Lesson selector shows all lessons in topic
- Question count inputs with defaults (30/30/30)
- Total auto-calculates
- Prompt preview with populated values + schema
- Generates quiz via API
- Validates response against schema
- Shows JSON preview on success
- Error handling with retry/manual fix options
- Saves to file system with versioning

**Sub-components**:
- `QuizForm`: Form inputs
- `PromptPreview`: Read-only prompt display
- `JSONPreview`: Raw JSON display
- `ErrorDisplay`: Error message + retry options
- `SaveButton`: Save to file system

---

## Context Providers

### LLMSettingsContext
```typescript
interface LLMSettings {
  provider: string;
  apiKey: string;
  isConnected: boolean;
  lastTestedAt?: string;
  error?: string;
}

interface LLMSettingsContextType {
  settings: LLMSettings;
  updateSettings: (settings: Partial<LLMSettings>) => void;
  testConnection: () => Promise<boolean>;
}
```

**Usage**:
- Provides API key and provider to all tabs
- Manages connection state
- Persists to localStorage

---

### SelectionContext
```typescript
interface Selection {
  category: string | null;
  subcategory: string | null;
  topic: string | null;
  type: 'lesson' | 'quiz' | null;
}

interface SelectionContextType {
  selection: Selection;
  updateSelection: (partial: Partial<Selection>) => void;
  categories: string[];
  subcategories: string[];
  topics: string[];
  loadSubcategories: (category: string) => Promise<void>;
  loadTopics: (category: string, subcategory: string) => Promise<void>;
}
```

**Usage**:
- Provides current selections to all tabs
- Manages cascading dropdown state
- Loads options from file system API

---

### GenerationContext
```typescript
interface GenerationState {
  isLoading: boolean;
  error: string | null;
  result: Lesson | Quiz | null;
  validationErrors: string[];
}

interface GenerationContextType {
  state: GenerationState;
  generateLesson: (prompt: string) => Promise<Lesson>;
  generateQuiz: (prompt: string) => Promise<Quiz>;
  saveLesson: (lesson: Lesson, path: string) => Promise<void>;
  saveQuiz: (quiz: Quiz, path: string) => Promise<void>;
}
```

**Usage**:
- Manages generation loading state
- Handles API calls to LLM
- Manages file save operations
- Tracks validation errors

---

## Data Flow Diagram

```
User Input (Selection Tab)
    ↓
Selection Context (category/subcategory/topic/type)
    ↓
    ├─→ Lessons Tab reads Selection context
    │   ├─→ User fills form (age, duration, instructions)
    │   ├─→ Form sends to API with LLM Settings context (API key)
    │   ├─→ Receives JSON response from LLM
    │   ├─→ Validates with Lesson schema
    │   ├─→ Shows preview
    │   └─→ Saves to file system
    │
    └─→ Quizzes Tab reads Selection context
        ├─→ User fills form (lesson, question counts, instructions)
        ├─→ Form sends to API with LLM Settings context (API key)
        ├─→ Receives JSON response from LLM
        ├─→ Validates with Quiz schema
        ├─→ Shows preview
        └─→ Saves to file system
```

---

## Styling & UI Components

**Based on existing project conventions**:
- Use Tailwind CSS for styling (consistent with main app)
- Use shadcn/ui components where available
- Dark mode support (existing theme system)
- Semantic colors (success, error, warning)

**Key UI Patterns**:
- Tab navigation (likely existing TabsComponent)
- Form inputs with labels
- Dropdown selects
- Spinners/loaders
- Status badges (✅ ❌)
- Error messages with actionable suggestions
- Code/JSON preview blocks

---

## Error Boundaries

```
DeveloperGenerator
├── LLMSettings Error Boundary
├── Selection Error Boundary
├── Lessons Error Boundary
└── Quizzes Error Boundary
```

Each tab should have its own error boundary to prevent one tab crash from affecting others.

---

## Hooks (Custom)

### useLessonPrompt
```typescript
function useLessonPrompt(params: {
  topic: string;
  ageGroup: string;
  duration: string;
  customInstructions: string;
}): {
  userPrompt: string;
  systemPrompt: string;
}
```

Generates system and user prompts for lesson generation. User prompt is displayed to user, includes schema.

---

### useQuizPrompt
```typescript
function useQuizPrompt(params: {
  lessonTitle: string;
  lessonId: string;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  customInstructions: string;
}): {
  userPrompt: string;
  systemPrompt: string;
}
```

Generates prompts for quiz generation.

---

### useOpenRouter
```typescript
function useOpenRouter(apiKey: string) {
  return {
    testConnection: () => Promise<boolean>;
    sendMessage: (params: {...}) => Promise<string>;
    isConnecting: boolean;
    error: string | null;
  };
}
```

Manages OpenRouter API communication and connection testing.

---

### useFileSystem
```typescript
function useFileSystem() {
  return {
    getCategories: () => Promise<string[]>;
    getSubcategories: (category: string) => Promise<string[]>;
    getTopics: (category: string, subcategory: string) => Promise<string[]>;
    getLessons: (category: string, subcategory: string, topic: string) => Promise<Lesson[]>;
    saveLesson: (path: string, lesson: Lesson) => Promise<void>;
    saveQuiz: (path: string, quiz: Quiz) => Promise<void>;
  };
}
```

Handles all file system operations via API endpoints.

---

## Accessibility (a11y)

- All form inputs have associated labels
- Error messages properly announced
- Tab order follows logical flow
- Color not the only indicator (use icons/text)
- Sufficient contrast in light/dark modes
- Loading states announced via aria-busy
- Form validation messages linked to inputs

---

## Performance Considerations

- Lazy-load tab content (don't render all tabs at once)
- Debounce file system lookups (cascading dropdowns)
- Memoize contexts to prevent unnecessary re-renders
- Stream long API responses (for large quizzes)
- Cache file system structure in sessionStorage
- Limit preview render size (don't show 10000 lines of JSON)

---

**Component structure is flexible and extensible for future enhancements!**
