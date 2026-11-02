# Dev Generator User Flow Diagrams

## 1. Overall Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  Developer Generator App                         │
├──────────────┬────────────────┬──────────────┬─────────────────┤
│ LLM Settings │   Selection    │   Lessons    │    Quizzes      │
├──────────────┼────────────────┼──────────────┼─────────────────┤
│              │                │              │                 │
│  ✓ Provider  │ ✓ Category     │ ✓ Topic      │ ✓ Topic         │
│  ✓ API Key   │ ✓ Subcategory  │ ✓ Age Group  │ ✓ Lesson        │
│  ✓ Test Con  │ ✓ Topic        │ ✓ Duration   │ ✓ Difficulty    │
│    nection   │ ✓ Create New   │ ✓ Custom     │ ✓ Question Cnt  │
│              │                │   Instructions
│              │                │ ✓ Prompt     │ ✓ Prompt        │
│              │                │   Template   │   Template      │
│              │                │ ✓ Generate   │ ✓ Generate      │
└──────────────┴────────────────┴──────────────┴─────────────────┘
```

## 2. Tab 1: LLM Settings - Connection Flow

```
User Interface
┌──────────────────────────────┐
│ Provider Dropdown            │
│ ┌──────────────────────────┐ │
│ │ OpenRouter               │ │  ← User selects provider
│ │ Claude (Coming Soon)     │ │
│ │ GPT-4 (Coming Soon)      │ │
│ └──────────────────────────┘ │
│                              │
│ API Key Input                │
│ ┌──────────────────────────┐ │
│ │ sk-or-v1-XXXXXXXXXXXX   │ │  ← User enters API key
│ └──────────────────────────┘ │
│                              │
│ [🔗 Test Connection]         │  ← User clicks button
│                              │
└──────────────────────────────┘
                ↓
         [SEND TEST REQUEST]
                ↓
         OpenRouter API
    (Validate API Key)
                ↓
    ┌───────────┴───────────┐
    │                       │
    ✓ Valid Key       ✗ Invalid Key
    │                       │
    ↓                       ↓
┌─────────┐          ┌──────────────┐
│✅ Green │          │❌ Red X      │
│Checkmark│          │Error Message:│
│Connected│          │Invalid API key
└─────────┘          └──────────────┘
    │                       │
    ↓                       ↓
Store in          Keep form editable
localStorage      Show error hint
Enable other
tabs
```

## 3. Tab 2: Selection - Cascading Dropdowns

```
CATEGORY SELECTION
┌────────────────────────────────────┐
│ Category ▼                         │
│ ┌──────────────────────────────┐  │
│ │ • Spoken Languages           │  │
│ │ • Grammar & Writing          │  │
│ │ + Create New Category        │  │
│ └──────────────────────────────┘  │
└────────────────────────────────────┘
           ↓ [User Selects]
           
SUBCATEGORY SELECTION (Cascading)
┌────────────────────────────────────┐
│ Subcategory ▼                      │
│ ┌──────────────────────────────┐  │
│ │ • French                     │  │  ← Only options from
│ │ • Spanish                    │  │     selected category
│ │ + Create New Subcategory     │  │
│ └──────────────────────────────┘  │
└────────────────────────────────────┘
           ↓ [User Selects]

TOPIC SELECTION (Cascading)
┌────────────────────────────────────┐
│ Topic ▼                            │
│ ┌──────────────────────────────┐  │
│ │ • Greetings                  │  │  ← Only options from
│ │ • Numbers 1-10               │  │     selected subcategory
│ │ + Create New Topic           │  │
│ └──────────────────────────────┘  │
└────────────────────────────────────┘
           ↓ [User Selects]

GENERATION TYPE SELECTION
┌────────────────────────────────────┐
│ What to generate?                  │
│ ○ Lesson                           │
│ ● Quiz                             │
└────────────────────────────────────┘
     ↓ [Selection Complete]
     
[→ Go to Lessons Tab]  or  [→ Go to Quizzes Tab]
```

## 4. Tab 3: Lessons - Generation Flow

```
FORM INPUT
┌─────────────────────────────────────────┐
│ Topic: Greetings (auto-filled)          │
│ Age Group: [9-12 years ▼]               │
│ Duration: [30 minutes ▼]                │
│ Custom Instructions: ________________   │  ← MANDATORY
│ ______________________________________   │
│ ______________________________________   │
└─────────────────────────────────────────┘
           ↓ [Auto-update on input]

PROMPT TEMPLATE PREVIEW
┌─────────────────────────────────────────┐
│ User Prompt Template (read-only)        │
│                                         │
│ Create a language lesson...             │
│ Target Age Group: 9-12 years            │
│ Duration: 30 minutes                    │
│ Topic: Greetings                        │
│ Custom Instructions: [from input]       │
│                                         │
│ Output Format (JSON Schema):            │
│ ```json                                 │
│ {                                       │
│   "title": "string",                    │
│   "objectives": ["string[]"],           │
│   "sections": [                         │
│     {                                   │
│       "title": "string",                │
│       "content": "markdown"             │
│     }                                   │
│   ],                                    │
│   ...                                   │
│ }                                       │
│ ```                                     │
└─────────────────────────────────────────┘
           ↓ [Click Generate]

[🚀 Generate Lesson]
           ↓
    [SENDING TO LLM]
    (Spinning indicator)
           ↓
    ┌──────────────┴────────────────┐
    │                               │
Success (JSON + Schema Match)   Failure (Parse/Schema Error)
    │                               │
    ↓                               ↓
┌─────────────────┐      ┌──────────────────────┐
│ MARKDOWN PREVIEW│      │ VALIDATION ERROR     │
│                 │      │                      │
│ [Rendered MD]   │      │ ❌ Invalid JSON     │
│ + metadata      │      │ "objects expected   │
│                 │      │  at line 45"        │
│ [✓ Save]        │      │                      │
│ [✏️ Edit JSON]   │      │ [🔄 Retry]          │
│ [❌ Discard]     │      │ [📝 Manual Fix]     │
└─────────────────┘      │ [👁️ View Raw]       │
      ↓                  └──────────────────────┘
  [SAVE]                         ↓
      ↓                  [Edit JSON or Retry]
┌───────────────┐               ↓
│ ✅ Saved!     │          [Revalidate]
│ Lesson saved  │               ↓
│ to file:      │         [Success Path]
│ lesson-..v1.md
└───────────────┘
```

## 5. Tab 4: Quizzes - Generation Flow

```
FORM INPUT
┌──────────────────────────────────────┐
│ Topic: Greetings (auto-filled)       │
│ Lesson: [Select Lesson ▼]            │  ← Required dropdown
│ ┌────────────────────────────────┐  │     showing all lessons
│ │ Lesson 1 (Greetings) - Nov 01  │  │     in topic
│ │ Lesson 2 (Greetings) - Oct 15  │  │
│ └────────────────────────────────┘  │
│                                      │
│ Questions per Difficulty:            │
│ Easy:   [30]                         │
│ Medium: [30]                         │
│ Hard:   [30]                         │
│ Total:  [90] (auto-calculated)       │
│                                      │
│ Custom Instructions: ______________  │  ← MANDATORY
│ ______________________________________│
└──────────────────────────────────────┘
           ↓ [Auto-update on input]

PROMPT TEMPLATE PREVIEW
┌──────────────────────────────────────┐
│ User Prompt Template (read-only)     │
│                                      │
│ Create a language learning quiz...   │
│ Lesson: Greetings                    │
│ Easy: 30, Medium: 30, Hard: 30       │
│ Total: 90 questions                  │
│ Custom: [from input]                 │
│                                      │
│ Output Format (JSON Schema):         │
│ ```json                              │
│ {                                    │
│   "title": "string",                 │
│   "lesson_id": "string",             │
│   "quiz_version": 1,                 │
│   "questions": [                     │
│     {                                │
│       "id": "string",                │
│       "type": "multiple-choice|...", │
│       "question": "string",          │
│       "difficulty": "easy|medium|    │
│                     hard",           │
│       ...                            │
│     }                                │
│   ],                                 │
│   ...                                │
│ }                                    │
│ ```                                  │
└──────────────────────────────────────┘
           ↓ [Click Generate]

[🚀 Generate Quiz]
           ↓
    [SENDING TO LLM]
           ↓
    ┌──────────────┴──────────────────────┐
    │                                     │
Success (JSON + Question Cnt OK)    Failure (Schema/Count Error)
    │                                     │
    ↓                                     ↓
┌─────────────────┐          ┌────────────────────────┐
│ JSON PREVIEW    │          │ VALIDATION ERROR       │
│                 │          │                        │
│ {               │          │ ❌ Schema mismatch     │
│   "title": ..., │          │ Expected 90 questions, │
│   "lesson_id"...,           │ got 85                 │
│   "questions": [│          │                        │
│   {             │          │ [🔄 Retry]            │
│   "id": "q1",   │          │ [📝 Manual Fix]        │
│   "question"... │          │ [👁️ View Raw]         │
│   }, ...        │          └────────────────────────┘
│   ]             │                     ↓
│ }               │          [Edit JSON or Retry]
│                 │                     ↓
│ [✓ Save]        │            [Revalidate]
│ [❌ Discard]     │                     ↓
└─────────────────┘           [Success Path]
      ↓
  [SAVE]
      ↓
┌──────────────────┐
│ ✅ Saved!        │
│ Quiz v1 saved to │
│ quiz-[id]-v1.json│
└──────────────────┘
```

## 6. File System Structure After Generation

```
/data/categories/
├── Spoken Languages/
│   ├── French/
│   │   ├── Greetings/
│   │   │   ├── lesson-greetings-v1.md
│   │   │   ├── lesson-greetings-v2.md
│   │   │   ├── quiz-greetings-v1.json (for lesson-v1)
│   │   │   ├── quiz-greetings-v2.json (for lesson-v1)
│   │   │   └── quiz-greetings-v3.json (for lesson-v2)
│   │   └── Numbers/
│   │       ├── lesson-numbers-v1.md
│   │       └── quiz-numbers-v1.json
│   └── Spanish/
│       ├── Greetings/
│       └── ...
└── Grammar & Writing/
    └── ...
```

## 7. Data Flow: LLM Provider to File System

```
┌──────────────────┐
│   User Form      │
│  (All values)    │
└────────┬─────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│ Build Prompts (System + User Template)  │
│ System prompt is NOT shown to user      │
│ User prompt is SHOWN in text field      │
│ with populated values + JSON schema     │
└────────┬────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  LLMProvider (OpenRouter Adapter)    │
│  - Validate API key                  │
│  - Send to OpenRouter API            │
│  - Get response (should be JSON)     │
└────────┬───────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│ Parse Response                      │
│ Try JSON.parse(response)            │
│ Handle errors gracefully            │
└────────┬──────────────────────────┘
         │
         ↓
    ┌────┴────┐
    │          │
Success      Failure
    │          │
    ↓          ↓
┌────────┐  ┌──────────────────┐
│Validate│  │Show error + offer│
│Schema  │  │Retry/Manual Fix  │
└───┬────┘  └──────────────────┘
    │
    ├─ Valid
    │   ↓
    │  ┌─────────────────────┐
    │  │ Show Preview        │
    │  │ (Markdown or JSON)  │
    │  │ [Save] [Edit]       │
    │  └────────┬────────────┘
    │           ↓
    │  ┌─────────────────────┐
    │  │ Write to File System│
    │  │ ├─ Lesson: .md file │
    │  │ └─ Quiz: .json file │
    │  └────────┬────────────┘
    │           ↓
    │  ┌─────────────────────┐
    │  │ ✅ Success Message  │
    │  │ File path shown     │
    │  │ [Generate Another?] │
    │  └─────────────────────┘
    │
    └─ Invalid
        ↓
       [Show validation errors]
```

## 8. API Key Lifecycle

```
App Loads
   │
   ├─ Check localStorage for saved keys
   │   └─ dev_llm_apikeys: { openRouter: "sk-or-...", ... }
   │
   ↓
LLM Settings Tab Opens
   │
   ├─ Provider selector dropdown
   │   └─ Show list of providers
   │
   ↓
User selects OpenRouter
   │
   ├─ Check if key in localStorage
   │   ├─ Yes: Pre-fill input field
   │   └─ No: Empty field
   │
   ↓
User enters API key
   │
   ├─ [Test Connection] clicked
   │   ├─ POST /api/dev/test-connection
   │   ├─ OpenRouter API responds
   │   ├─ Valid: ✅ Green checkmark, save to localStorage
   │   └─ Invalid: ❌ Red X, show error, don't save
   │
   ↓
User navigates to other tabs
   │
   ├─ Lessons/Quizzes tabs enabled
   │   └─ Use stored API key from context/localStorage
   │
   ↓
User closes/reloads page
   │
   └─ Stored key persists in localStorage
      └─ User can generate again without re-entering key
```

---

**Each diagram shows the complete flow for that feature with decision points and outcomes.**
