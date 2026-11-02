# Dev Generator - Detailed Schemas

## Lesson Output Schema

### JSON Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Language Learning Lesson",
  "type": "object",
  "required": ["title", "objectives", "sections", "metadata"],
  "properties": {
    "title": {
      "type": "string",
      "description": "The main title of the lesson",
      "minLength": 5,
      "maxLength": 100
    },
    "objectives": {
      "type": "array",
      "description": "Learning objectives for this lesson",
      "items": {
        "type": "string",
        "minLength": 5,
        "maxLength": 200
      },
      "minItems": 1,
      "maxItems": 10
    },
    "sections": {
      "type": "array",
      "description": "Main content sections of the lesson",
      "items": {
        "type": "object",
        "required": ["title", "content"],
        "properties": {
          "title": {
            "type": "string",
            "minLength": 3,
            "maxLength": 50
          },
          "content": {
            "type": "string",
            "description": "Markdown content (supports: headers, lists, tables, code blocks, bold, italic, links)",
            "minLength": 20
          }
        }
      },
      "minItems": 1,
      "maxItems": 20
    },
    "keyTakeaways": {
      "type": "array",
      "description": "Key learnings from this lesson",
      "items": {
        "type": "string",
        "minLength": 5,
        "maxLength": 150
      },
      "minItems": 1,
      "maxItems": 5
    },
    "metadata": {
      "type": "object",
      "required": ["ageGroup", "duration", "language", "createdAt"],
      "properties": {
        "ageGroup": {
          "type": "string",
          "enum": ["5-8 years", "9-12 years", "13-18 years", "18+ years"],
          "description": "Target age group for this lesson"
        },
        "duration": {
          "type": "string",
          "enum": ["15 minutes", "30 minutes", "45 minutes", "60 minutes"],
          "description": "Expected time to complete lesson"
        },
        "language": {
          "type": "string",
          "description": "Language being taught",
          "minLength": 2,
          "maxLength": 30
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 timestamp when lesson was created"
        }
      }
    }
  }
}
```

### TypeScript Interface

```typescript
interface Lesson {
  title: string;
  objectives: string[];
  sections: LessonSection[];
  keyTakeaways: string[];
  metadata: LessonMetadata;
}

interface LessonSection {
  title: string;
  content: string; // Markdown format
}

interface LessonMetadata {
  ageGroup: '5-8 years' | '9-12 years' | '13-18 years' | '18+ years';
  duration: '15 minutes' | '30 minutes' | '45 minutes' | '60 minutes';
  language: string;
  createdAt: string; // ISO 8601
}
```

### Example Output

```json
{
  "title": "French Greetings - A Comprehensive Introduction",
  "objectives": [
    "Learn and practice the most common French greetings",
    "Understand cultural context for formal vs informal greetings",
    "Practice pronunciation with native speaker examples",
    "Build confidence in basic conversational exchanges"
  ],
  "sections": [
    {
      "title": "Introduction to French Greetings",
      "content": "## Why French Greetings Matter\n\nGreetings are the foundation of any language. In French culture, proper greetings are essential for:\n\n- **Building relationships**: First impressions count\n- **Showing respect**: Different situations call for different greetings\n- **Cultural understanding**: French etiquette has specific rules\n\n### Formal vs Informal\n\nUnlike English, French has clear distinctions:\n\n| Context | Greeting | Pronunciation |\n|---------|----------|---------------|\n| Formal | Bonjour | bohn-ZHOOR |\n| Informal | Coucou | koo-KOO |"
    },
    {
      "title": "Common Greetings",
      "content": "## Most Used Greetings\n\n### Time-Based Greetings\n\n- **Bonjour** (Good morning/afternoon)\n- **Bonsoir** (Good evening)\n- **Bonne nuit** (Good night - only when going to bed)\n\n### Response Patterns\n\nWhen someone greets you:\n```\nThem: Bonjour!\nYou:  Bonjour! Ça va?\nThem: Ça va bien, merci. Et toi?\nYou:  Très bien, merci!\n```"
    },
    {
      "title": "Practice Conversations",
      "content": "## Scenario 1: Meeting a Friend\n\n**Friend**: Salut! Ça va?\n**You**: Ça va bien! Et toi?\n**Friend**: Pas mal! Tu veux boire un café?\n\n## Scenario 2: Meeting Your Teacher\n\n**Teacher**: Bonjour! Comment allez-vous?\n**You**: Très bien, merci. Et vous?\n**Teacher**: Bien, merci d'avoir demandé."
    }
  ],
  "keyTakeaways": [
    "Bonjour is used until evening, then Bonsoir",
    "Handshakes or cheek kisses (la bise) are common",
    "Always use formal 'vous' with people you don't know",
    "Ça va? is both a greeting and a genuine question about wellbeing"
  ],
  "metadata": {
    "ageGroup": "9-12 years",
    "duration": "30 minutes",
    "language": "French",
    "createdAt": "2026-11-01T21:43:33.329Z"
  }
}
```

### Markdown Content Capabilities

The `content` field supports the following Markdown elements:

- **Headers**: `# H1`, `## H2`, `### H3`
- **Bold**: `**text**`
- **Italic**: `*text*`
- **Lists**: `- item` or `1. numbered`
- **Tables**: 
  ```
  | Header 1 | Header 2 |
  |----------|----------|
  | Cell 1   | Cell 2   |
  ```
- **Code blocks**: ` ```language ... ``` `
- **Inline code**: `` `code` ``
- **Links**: `[text](url)`
- **Blockquotes**: `> quoted text`
- **Horizontal rule**: `---`

**NOT supported**: HTML tags, embedded images, custom CSS

---

## Quiz Output Schema

### JSON Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Language Learning Quiz",
  "type": "object",
  "required": ["title", "lesson_id", "quiz_version", "questions", "metadata"],
  "properties": {
    "title": {
      "type": "string",
      "description": "Quiz title",
      "minLength": 5,
      "maxLength": 100
    },
    "lesson_id": {
      "type": "string",
      "description": "ID of the lesson this quiz tests",
      "minLength": 3
    },
    "quiz_version": {
      "type": "integer",
      "description": "Version number (starts at 1, increments with each new version)",
      "minimum": 1
    },
    "questions": {
      "type": "array",
      "description": "Array of quiz questions",
      "items": {
        "type": "object",
        "required": ["id", "type", "question", "correctAnswer", "explanation", "difficulty", "points"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique question identifier",
            "minLength": 3
          },
          "type": {
            "type": "string",
            "enum": ["multiple-choice", "true-false", "short-answer"],
            "description": "Type of question"
          },
          "question": {
            "type": "string",
            "description": "The question text",
            "minLength": 5,
            "maxLength": 500
          },
          "options": {
            "type": "array",
            "description": "Answer options (required for multiple-choice and true-false)",
            "items": {
              "type": "string",
              "minLength": 1
            },
            "minItems": 2,
            "maxItems": 6
          },
          "correctAnswer": {
            "oneOf": [
              { "type": "string", "minLength": 1 },
              { "type": "integer", "minimum": 0 }
            ],
            "description": "The correct answer (string for short-answer, integer index for multiple-choice)"
          },
          "explanation": {
            "type": "string",
            "description": "Explanation of the correct answer",
            "minLength": 10,
            "maxLength": 500
          },
          "difficulty": {
            "type": "string",
            "enum": ["easy", "medium", "hard"],
            "description": "Difficulty level of the question"
          },
          "points": {
            "type": "integer",
            "description": "Points awarded for correct answer",
            "minimum": 1,
            "maximum": 10
          }
        }
      },
      "minItems": 1
    },
    "metadata": {
      "type": "object",
      "required": ["totalQuestions", "createdAt", "lessonId"],
      "properties": {
        "totalQuestions": {
          "type": "integer",
          "description": "Total number of questions in quiz",
          "minimum": 1
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 timestamp when quiz was created"
        },
        "lessonId": {
          "type": "string",
          "description": "Reference to lesson ID"
        }
      }
    }
  }
}
```

### TypeScript Interface

```typescript
interface Quiz {
  title: string;
  lesson_id: string;
  quiz_version: number;
  questions: QuizQuestion[];
  metadata: QuizMetadata;
}

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[]; // Required for multiple-choice and true-false
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface QuizMetadata {
  totalQuestions: number;
  createdAt: string; // ISO 8601
  lessonId: string;
}
```

### Example Output

```json
{
  "title": "French Greetings Quiz - Complete Assessment",
  "lesson_id": "greetings-lesson-001",
  "quiz_version": 1,
  "questions": [
    {
      "id": "q1-easy-vocab",
      "type": "multiple-choice",
      "question": "What is the correct French greeting to use in the morning?",
      "options": [
        "Bonjour",
        "Bonsoir",
        "Bonne nuit",
        "Salut"
      ],
      "correctAnswer": 0,
      "explanation": "Bonjour (good day) is used from morning until evening. Bonsoir is used in the evening, and Bonne nuit is only used when going to bed.",
      "difficulty": "easy",
      "points": 1
    },
    {
      "id": "q2-easy-true-false",
      "type": "true-false",
      "question": "In French, you should use 'tu' (informal) when greeting someone you don't know well.",
      "options": ["True", "False"],
      "correctAnswer": 1,
      "explanation": "False. When greeting someone you don't know or in formal situations, you should use 'vous' (formal). Save 'tu' for friends and family.",
      "difficulty": "easy",
      "points": 1
    },
    {
      "id": "q3-medium-context",
      "type": "multiple-choice",
      "question": "You meet your colleague for the first time. Which greeting is most appropriate?",
      "options": [
        "Coucou! Ça va?",
        "Bonjour! Enchanté de vous rencontrer.",
        "Salut! Quoi de neuf?",
        "Yo! Comment ça va?"
      ],
      "correctAnswer": 1,
      "explanation": "In a professional first meeting, 'Bonjour! Enchanté de vous rencontrer' (Hello! Pleased to meet you) with formal 'vous' is the most appropriate choice.",
      "difficulty": "medium",
      "points": 2
    },
    {
      "id": "q4-medium-cultural",
      "type": "true-false",
      "question": "Handshakes and cheek kisses (la bise) are always acceptable as greetings in France.",
      "options": ["True", "False"],
      "correctAnswer": 1,
      "explanation": "False. While handshakes and la bise are common, context matters. Always observe what others do or ask for permission first.",
      "difficulty": "medium",
      "points": 2
    },
    {
      "id": "q5-hard-conversation",
      "type": "short-answer",
      "question": "Translate the following phrase to French: 'How are you?' (formal)",
      "options": [],
      "correctAnswer": "Comment allez-vous?",
      "explanation": "Comment allez-vous? is the formal way to ask how someone is. The informal version is Comment ça va? or Comment vas-tu?",
      "difficulty": "hard",
      "points": 3
    }
  ],
  "metadata": {
    "totalQuestions": 5,
    "createdAt": "2026-11-01T21:43:33.329Z",
    "lessonId": "greetings-lesson-001"
  }
}
```

### Question Type Details

#### Multiple-Choice Questions
- Must have 2-6 options
- `correctAnswer` is the index (0-based) of the correct option
- Example: If options are ["Paris", "London", "Madrid"] and `correctAnswer` is 0, "Paris" is correct

#### True-False Questions
- Must have exactly 2 options: ["True", "False"]
- `correctAnswer` is either 0 (True) or 1 (False)
- Typically worth 1-2 points

#### Short-Answer Questions
- No options field
- `correctAnswer` is a string with the expected answer
- Can accept variations (app should do fuzzy matching)
- Typically worth 3-5 points

---

## Difficulty Distribution

When generating quizzes, follow these guidelines:

### Distribution Rules
```
Total Questions = Easy + Medium + Hard

Default (30/30/30):
- Easy:   30 questions (33%)
- Medium: 30 questions (33%)
- Hard:   30 questions (34%)

User can customize, but recommend:
- Easy:   20-40% of total
- Medium: 30-50% of total
- Hard:   20-40% of total

Examples:
- Total 30: Easy=10, Medium=10, Hard=10
- Total 50: Easy=15, Medium=20, Hard=15
- Total 20: Easy=8, Medium=8, Hard=4
```

### Question Difficulty Indicators

**Easy Questions**:
- Test basic vocabulary recall
- Direct application of lesson material
- Multiple-choice with clear distractor options
- Points: 1-2

**Medium Questions**:
- Test understanding and application
- Require combining concepts
- May test cultural knowledge
- Points: 2-3

**Hard Questions**:
- Test synthesis and analysis
- Real-world conversation scenarios
- Pronunciation and nuanced differences
- Short-answer preferred
- Points: 3-5

---

## File Naming & Versioning

### Lesson Files
```
/data/categories/[category]/[subcategory]/[topic]/
  lesson-[topic-slug]-v1.md
  lesson-[topic-slug]-v2.md
  lesson-[topic-slug]-v3.md
```

**Auto-increment rules**:
- First generation: v1
- Next generation for same lesson: Check existing versions, use next number
- Example: If v1 and v2 exist, create v3

### Quiz Files
```
/data/categories/[category]/[subcategory]/[topic]/
  quiz-[lesson-id]-v1.json  (for lesson-[topic-slug]-v1.md)
  quiz-[lesson-id]-v2.json  (for lesson-[topic-slug]-v1.md)
  quiz-[lesson-id]-v3.json  (for lesson-[topic-slug]-v2.md)
```

**Quiz linking**:
- `lesson_id` in quiz JSON indicates which lesson version it tests
- Multiple quiz versions can exist for single lesson
- Versioning is independent from lesson versions

---

## Markdown Content Guidelines for Lessons

### Supported Elements

✅ **Headers**
```markdown
# Heading 1
## Heading 2
### Heading 3
```

✅ **Text Formatting**
```markdown
**Bold text** or __bold__
*Italic text* or _italic_
***Bold and italic***
~~Strikethrough~~
```

✅ **Lists**
```markdown
- Unordered item 1
- Unordered item 2
  - Nested item
  
1. Ordered item 1
2. Ordered item 2
   1. Nested ordered
```

✅ **Code**
```markdown
Inline `code` with backticks

Code blocks:
```python
def hello():
    print("Hello, World!")
```
```

✅ **Tables**
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

✅ **Links**
```markdown
[Link text](https://example.com)
[Relative link](../path/to/file)
```

✅ **Blockquotes**
```markdown
> This is a blockquote
> It can span multiple lines
> > Nested blockquote
```

✅ **Horizontal Rules**
```markdown
---
***
___
```

❌ **NOT Supported**
- HTML tags (will be stripped)
- Embedded images/video
- CSS/styling
- Footnotes
- Mermaid diagrams

---

## Validation Checklist

### Before Accepting Lesson

- [ ] Title: 5-100 characters
- [ ] Objectives: 1-10 items, each 5-200 characters
- [ ] Sections: 1-20 items
  - [ ] Section title: 3-50 characters
  - [ ] Content: Valid Markdown, 20+ characters
- [ ] Key Takeaways: 1-5 items, each 5-150 characters
- [ ] Metadata:
  - [ ] ageGroup: Valid enum value
  - [ ] duration: Valid enum value
  - [ ] language: 2-30 characters
  - [ ] createdAt: Valid ISO 8601 timestamp

### Before Accepting Quiz

- [ ] Title: 5-100 characters
- [ ] lesson_id: Non-empty string
- [ ] quiz_version: Positive integer
- [ ] Questions: 1+ items
  - [ ] id: Unique, non-empty
  - [ ] type: Valid enum (multiple-choice|true-false|short-answer)
  - [ ] question: 5-500 characters
  - [ ] options: 2-6 items (if applicable)
  - [ ] correctAnswer: Matches question type
  - [ ] explanation: 10-500 characters
  - [ ] difficulty: Valid enum (easy|medium|hard)
  - [ ] points: 1-10
- [ ] Metadata:
  - [ ] totalQuestions: Matches `questions.length`
  - [ ] createdAt: Valid ISO 8601 timestamp
  - [ ] lessonId: Non-empty string

---

**These schemas provide strict validation to ensure consistent, high-quality content from LLM generation.**
