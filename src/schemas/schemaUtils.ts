/**
 * Schema utilities for generating JSON schema documentation
 * Automatically converts Zod schemas to JSON Schema format for use in LLM prompts
 * 
 * This replaces manual JSON schema documentation with automatic generation
 * from the source of truth (Zod definitions)
 */

import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { GeneratedLessonSchema, LessonFrontmatterSchema } from '../schemas/lesson.schema'
import { GeneratedQuizSchema, QuizQuestionSchema } from '../schemas/quiz.schema'

/**
 * Convert Zod schema to JSON Schema and format as readable documentation
 */
function formatJsonSchema(schema: any): string {
  const jsonSchema = zodToJsonSchema(schema, {
    name: schema.description || 'Schema'
  })

  return JSON.stringify(jsonSchema, null, 2)
}

/**
 * Generate lesson output guide with Zod-derived schema
 * This is the single source of truth for lesson output format
 * Any changes to GeneratedLessonSchema automatically update all lesson prompts
 */
export function generateLessonOutputGuide(): string {
  const jsonSchema = zodToJsonSchema(GeneratedLessonSchema as any, {
    name: 'GeneratedLesson'
  })

  return `
## Output Format (JSON)

Your response must be ONLY valid JSON in this exact format:

\`\`\`json
${JSON.stringify(jsonSchema, null, 2)}
\`\`\`

## Required Fields

- **title**: Clear, descriptive lesson title (e.g., "Introduction to French Numbers 0-10")
- **summary**: Brief one-line summary of what the lesson covers
- **duration**: Estimated time to complete (e.g., "30-45 minutes")
- **active**: Boolean, set to true
- **difficulty**: One of: beginner, intermediate, advanced
- **learningObjectives**: Array of 1+ key outcomes students should achieve
- **tags**: Array of keywords for categorization
- **content**: Full markdown content with all lesson material

## Markdown Content Guidelines

The \`content\` field should contain complete, well-structured markdown:

**Supported Markdown Features:**
- Headings: # H1, ## H2, ### H3, etc.
- **Bold** and *italic* text
- Lists: - item, 1. numbered item
- Code blocks: \`\`\`language ... \`\`\`
- Tables: | Column | ... |
- Blockquotes: > text
- Links: [text](url)
- Callouts: > **Note**: text

**Content Structure Example:**
\`\`\`markdown
# Main Topic

## Learning Objectives
- Objective 1
- Objective 2

## Core Concepts

### First Concept
Explanation and examples.

\`\`\`code-example
Example code or language
\`\`\`

### Second Concept
More content with tables or lists as needed.

## Practice & Application
Practical exercises for students.

## Summary
Key takeaways.
\`\`\`

**Important Rules:**
1. All fields are required (except active, which defaults to true)
2. Return ONLY valid JSON, no markdown outside the JSON
3. Escape special characters in JSON strings
4. The content must be complete and self-contained
5. No images are supported; use descriptions or links instead
6. Use markdown formatting naturally to enhance understanding
`
}

/**
 * Generate quiz output guide with Zod-derived schema
 * This is the single source of truth for quiz output format
 * Any changes to GeneratedQuizSchema automatically update all quiz prompts
 */
export function generateQuizOutputGuide(): string {
  const quizSchema = zodToJsonSchema(GeneratedQuizSchema as any, {
    name: 'GeneratedQuiz'
  })

  const questionSchema = zodToJsonSchema(QuizQuestionSchema as any, {
    name: 'QuizQuestion'
  })

  return `
## Output Format (JSON)

Your response must be ONLY valid JSON in this exact format:

\`\`\`json
${JSON.stringify(quizSchema, null, 2)}
\`\`\`

## Question Format

Each question in the \`questions\` array must follow this structure:

\`\`\`json
${JSON.stringify(questionSchema, null, 2)}
\`\`\`

## Required Fields

- **title**: Descriptive quiz title (e.g., "French Numbers Quiz - Beginner")
- **lesson_id**: Unique identifier of the associated lesson
- **quiz_version**: Version number (1, 2, 3, ...)
- **questions**: Array of quiz questions
- **metadata**: Object with totalQuestions, createdAt, lessonId

### Question Fields

- **id**: Unique question identifier
- **type**: One of: multiple-choice, true-false, short-answer
- **question**: The question text/prompt
- **options**: Array of answer choices (required for multiple-choice and true-false)
  - Multiple-choice: exactly 4 options
  - True-false: exactly 2 options ["True", "False"]
  - Short-answer: omit this field
- **correctAnswer**: The correct answer (string for MC/T/F/short-answer, or number for index)
- **explanation**: Detailed explanation of why this is correct (for student learning)
- **difficulty**: One of: easy, medium, hard
- **points**: Points awarded for correct answer (positive integer)

## Question Generation Guidelines

### Multiple-Choice Questions
- Exactly 4 plausible options
- 1 correct answer
- 3 distractors that are:
  - Related to the topic
  - Common student mistakes
  - Clearly but not obviously incorrect

Example:
\`\`\`json
{
  "id": "q1",
  "type": "multiple-choice",
  "question": "What is the French word for 'five'?",
  "options": ["quatre", "cinq", "six", "trois"],
  "correctAnswer": "cinq",
  "explanation": "In French, 5 is 'cinq'. The other options are 4 (quatre), 6 (six), and 3 (trois).",
  "difficulty": "easy",
  "points": 1
}
\`\`\`

### True/False Questions
- Exactly 2 options: ["True", "False"]
- Clear, unambiguous statements
- Mix of obviously true/false and nuanced statements

Example:
\`\`\`json
{
  "id": "q2",
  "type": "true-false",
  "question": "The French word 'sept' means 7.",
  "options": ["True", "False"],
  "correctAnswer": "True",
  "explanation": "'Sept' is indeed the French word for 7.",
  "difficulty": "easy",
  "points": 1
}
\`\`\`

### Short-Answer Questions
- No options array
- Clear, specific correct answer
- Could accept multiple phrasings

Example:
\`\`\`json
{
  "id": "q3",
  "type": "short-answer",
  "question": "How would you say 'good morning' in French?",
  "correctAnswer": "Bonjour",
  "explanation": "'Bonjour' is the standard French greeting for good morning/day. It literally means 'good day'.",
  "difficulty": "easy",
  "points": 1
}
\`\`\`

## Distribution Guidelines

Distribute questions across difficulty levels as requested:
- **Easy**: Straightforward recall and basic comprehension
- **Medium**: Application of knowledge, contextual understanding
- **Hard**: Analysis, synthesis, complex application, or uncommon scenarios

Each question should test the learning objectives from the associated lesson.

## Important Rules

1. Return ONLY valid JSON, no markdown outside the JSON
2. Escape special characters in JSON strings (quotes, backslashes, newlines)
3. All questions must be relevant to the lesson topic
4. Explanations should be educational and help students learn
5. Ensure variety in question types when possible
6. Question progression should naturally go from easy → medium → hard
`
}

/**
 * Generate standalone Zod schema documentation
 * Useful for debugging or reference
 */
export function generateLessonSchemaDocumentation(): string {
  const schema = zodToJsonSchema(GeneratedLessonSchema as any, {
    name: 'GeneratedLesson'
  })
  return JSON.stringify(schema, null, 2)
}

/**
 * Generate standalone Zod schema documentation for quizzes
 * Useful for debugging or reference
 */
export function generateQuizSchemaDocumentation(): string {
  const schema = zodToJsonSchema(GeneratedQuizSchema as any, {
    name: 'GeneratedQuiz'
  })
  return JSON.stringify(schema, null, 2)
}
