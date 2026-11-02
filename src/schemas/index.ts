/**
 * Schemas folder - centralized schema definitions using Zod
 * 
 * This folder contains all data structure definitions as Zod schemas.
 * Zod provides:
 * - Type validation
 * - Automatic TypeScript type generation (z.infer)
 * - JSON Schema generation for LLM prompts
 * 
 * Single source of truth approach:
 * 1. Define structure in Zod (lesson.schema.ts, quiz.schema.ts)
 * 2. Generate JSON schemas automatically (schemaUtils.ts)
 * 3. Insert into LLM prompts dynamically
 * 4. Validate responses against Zod schemas
 * 
 * When you add/modify a field:
 * - Update the Zod schema in lesson.schema.ts or quiz.schema.ts
 * - Descriptions automatically flow to JSON schema and LLM prompts
 * - TypeScript types auto-update (z.infer)
 * - No manual JSON schema updates needed
 */

export {
  GeneratedLessonSchema,
  LessonFrontmatterSchema,
  LessonDifficultySchema,
  AgeGroupSchema,
  LessonMetadataSchema,
  LessonDefaults,
  type GeneratedLesson,
  type LessonFrontmatter,
  type LessonMetadata
} from './lesson.schema'

export {
  GeneratedQuizSchema,
  QuizQuestionSchema,
  QuizMetadataSchema,
  QuestionTypeSchema,
  DifficultyLevelSchema,
  QuizDefaults,
  type GeneratedQuiz,
  type QuizQuestion,
  type QuizMetadata
} from './quiz.schema'

export {
  generateLessonOutputGuide,
  generateQuizOutputGuide,
  generateLessonSchemaDocumentation,
  generateQuizSchemaDocumentation
} from './schemaUtils'
