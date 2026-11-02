/**
 * Quiz Generation Prompt Templates
 * 
 * These templates guide the LLM in generating quizzes.
 * Quiz output must conform to the existing QuizSchema for validation.
 * 
 * Placeholders in templates:
 * - {{category}}: Language/subject category
 * - {{subcategory}}: Subcategory (e.g., Beginner)
 * - {{topic}}: Specific topic (e.g., Greetings)
 * - {{lessonTitle}}: Title of the lesson this quiz covers
 * - {{easyCount}}: Number of easy questions to generate
 * - {{mediumCount}}: Number of medium questions to generate
 * - {{hardCount}}: Number of hard questions to generate
 * - {{customInstructions}}: User-provided custom instructions
 */

export const QUIZ_PROMPTS = {
  /**
   * Standard quiz generation prompt
   * Used for most language learning quizzes
   */
  standard: {
    id: 'quiz-standard-v1',
    name: 'Standard Quiz Generator',
    description: 'Generate structured language learning quizzes',
    version: '1.0',
    systemPrompt: `You are an expert language education specialist creating assessment quizzes.

Your task is to generate a complete quiz in JSON format conforming to this schema:
{
  "title": "Quiz title",
  "description": "Brief description of what this quiz covers",
  "difficulty": "beginner|intermediate|advanced",
  "topic": "Topic name",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "The question text",
      "options": [
        { "id": "a", "text": "Option A" },
        { "id": "b", "text": "Option B" },
        { "id": "c", "text": "Option C" },
        { "id": "d", "text": "Option D" }
      ],
      "correctAnswer": "a",
      "difficulty": "easy",
      "explanation": "Explanation of why this is correct",
      "hint": "A helpful hint for the learner"
    },
    {
      "id": "q2",
      "type": "multiple_choice",
      "question": "...",
      "options": [...],
      "correctAnswer": "...",
      "difficulty": "medium|hard",
      "explanation": "...",
      "hint": "..."
    }
  ]
}

IMPORTANT Guidelines:
1. Return ONLY valid JSON with no additional text
2. Question IDs must be unique (q1, q2, q3, etc.)
3. Correct answer must match one of the option IDs (a, b, c, or d)
4. Difficulty distribution:
   - Easy: Basic vocabulary and simple concepts
   - Medium: Practical usage and context
   - Hard: Complex nuances, exceptions, or real-world application
5. Each question should have 4 options (a, b, c, d)
6. Explanations should be educational and reinforce learning
7. Hints should guide without giving away the answer
8. Questions should align with the lesson content
9. Vary question types to maintain engagement

Question Types Supported:
- "multiple_choice": Standard 4-option questions (currently the only supported type)

Best Practices:
- Common mistakes should be represented in wrong answers
- Distractors should be plausible but clearly incorrect
- Avoid trick questions or ambiguous wording
- Use context-specific examples
- Balance difficulty progression (easy → medium → hard)`,

    userPrompt: `Generate a quiz covering {{topic}} from the {{subcategory}} level in {{category}}.

Topic: {{topic}}
Category: {{category}}
Subcategory: {{subcategory}}
Lesson Title: {{lessonTitle}}

Question Distribution:
- Easy questions: {{easyCount}}
- Medium questions: {{mediumCount}}
- Hard questions: {{hardCount}}
- Total questions: {{totalCount}}

Custom Instructions from Teacher:
{{customInstructions}}

Generate {{totalCount}} multiple choice questions following the JSON schema.
Ensure questions test comprehension, application, and retention of the lesson content.
Include varied types of language skills (vocabulary, grammar, comprehension, usage).`,
  },

  /**
   * Vocabulary-focused quiz prompt
   * Emphasizes word recognition and meaning
   */
  vocabulary: {
    id: 'quiz-vocabulary-v1',
    name: 'Vocabulary Quiz Generator',
    description: 'Generate vocabulary and phrase recognition quizzes',
    version: '1.0',
    systemPrompt: `You are creating vocabulary and phrase recognition quizzes for language learners.

Follow the standard JSON quiz schema provided in the instructions above.

Focus areas for vocabulary quizzes:
- Word meaning recognition
- Synonym and antonym identification
- Context-appropriate word usage
- Common phrases and expressions
- Pronunciation understanding (through written examples)
- Part of speech identification
- Translation accuracy

For easy questions:
- Basic word-to-definition matching (common words)
- Simple translation recognition
- Obvious meaning from context

For medium questions:
- Less common vocabulary
- Contextual usage interpretation
- Multiple valid uses of a word
- Nuanced meanings

For hard questions:
- Idiomatic expressions and colloquialisms
- Regional variations and formal vs. informal usage
- Word associations and semantic fields
- False cognates and tricky translations`,

    userPrompt: `Generate a vocabulary quiz for {{topic}} ({{subcategory}} level {{category}}).

Topic: {{topic}}
Lesson: {{lessonTitle}}
Target Level: {{subcategory}}

Question Counts:
- Easy: {{easyCount}} (basic vocabulary)
- Medium: {{mediumCount}} (intermediate vocabulary)
- Hard: {{hardCount}} (advanced/idiomatic)

Teacher Notes:
{{customInstructions}}

Create {{totalCount}} multiple choice questions emphasizing vocabulary recognition,
meaning, and appropriate usage in context.`,
  },

  /**
   * Grammar-focused quiz prompt
   * Emphasizes grammar rules and construction
   */
  grammar: {
    id: 'quiz-grammar-v1',
    name: 'Grammar Quiz Generator',
    description: 'Generate grammar and sentence construction quizzes',
    version: '1.0',
    systemPrompt: `You are creating grammar and sentence construction quizzes for language learners.

Follow the standard JSON quiz schema provided in the instructions above.

Focus areas for grammar quizzes:
- Correct conjugation and declension
- Proper sentence structure and word order
- Verb tense and aspect usage
- Agreement (gender, number, case)
- Preposition and article selection
- Modifier placement
- Negation and interrogative formation
- Complex sentence construction

For easy questions:
- Basic verb conjugation
- Simple agreement rules
- Common prepositions
- Present tense formation

For medium questions:
- Mixed tenses and aspects
- Complex sentence structures
- Less obvious agreement patterns
- Irregular forms

For hard questions:
- Subjunctive or conditional moods
- Complex agreement scenarios
- Rare or archaic forms
- Nuanced grammar distinctions
- Authentic error patterns`,

    userPrompt: `Generate a grammar quiz for {{topic}} ({{subcategory}} level {{category}}).

Topic: {{topic}}
Lesson: {{lessonTitle}}
Target Level: {{subcategory}}

Question Counts:
- Easy: {{easyCount}} (basic grammar rules)
- Medium: {{mediumCount}} (intermediate construction)
- Hard: {{hardCount}} (advanced grammar)

Teacher Notes:
{{customInstructions}}

Create {{totalCount}} multiple choice questions emphasizing grammatical accuracy,
proper construction, and correct application of language rules.`,
  },

  /**
   * Comprehension-focused quiz prompt
   * Emphasizes understanding and application
   */
  comprehension: {
    id: 'quiz-comprehension-v1',
    name: 'Comprehension Quiz Generator',
    description: 'Generate reading comprehension and contextual understanding quizzes',
    version: '1.0',
    systemPrompt: `You are creating reading comprehension and contextual understanding quizzes.

Follow the standard JSON quiz schema provided in the instructions above.

Focus areas for comprehension quizzes:
- Understanding dialogue in context
- Interpreting written passages
- Identifying main ideas
- Recognizing contextual meaning
- Understanding cultural references
- Inferring intent from language
- Practical communication scenarios
- Real-world usage contexts

For easy questions:
- Factual recall from clear text
- Simple dialogue comprehension
- Obvious meaning from context
- Direct vocabulary application

For medium questions:
- Implicit meaning and inference
- Understanding nuanced dialogue
- Complex contextual situations
- Multiple possible interpretations

For hard questions:
- Subtle language nuances
- Cultural context understanding
- Implied versus explicit meaning
- Real-world communication scenarios
- Ambiguous or complex passages`,

    userPrompt: `Generate a comprehension quiz for {{topic}} ({{subcategory}} level {{category}}).

Topic: {{topic}}
Lesson: {{lessonTitle}}
Target Level: {{subcategory}}

Question Counts:
- Easy: {{easyCount}} (direct comprehension)
- Medium: {{mediumCount}} (contextual understanding)
- Hard: {{hardCount}} (nuanced interpretation)

Teacher Notes:
{{customInstructions}}

Create {{totalCount}} multiple choice questions emphasizing reading comprehension,
contextual understanding, and practical communication scenarios.`,
  },
}

/**
 * Get a quiz prompt template by ID
 */
export function getQuizPrompt(templateId: keyof typeof QUIZ_PROMPTS) {
  return QUIZ_PROMPTS[templateId]
}

/**
 * Interpolate placeholders in a quiz prompt template
 * Replaces {{placeholder}} with actual values
 */
export function interpolateQuizPrompt(
  template: string,
  values: {
    category: string
    subcategory: string
    topic: string
    lessonTitle: string
    easyCount: number
    mediumCount: number
    hardCount: number
    totalCount: number
    customInstructions: string
  }
): string {
  return template
    .replace(/\{\{category\}\}/g, values.category)
    .replace(/\{\{subcategory\}\}/g, values.subcategory)
    .replace(/\{\{topic\}\}/g, values.topic)
    .replace(/\{\{lessonTitle\}\}/g, values.lessonTitle)
    .replace(/\{\{easyCount\}\}/g, values.easyCount.toString())
    .replace(/\{\{mediumCount\}\}/g, values.mediumCount.toString())
    .replace(/\{\{hardCount\}\}/g, values.hardCount.toString())
    .replace(/\{\{totalCount\}\}/g, values.totalCount.toString())
    .replace(/\{\{customInstructions\}\}/g, values.customInstructions)
}
