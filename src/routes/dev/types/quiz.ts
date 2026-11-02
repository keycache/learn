/**
 * DEPRECATED: Quiz types have been migrated to Zod schemas
 * 
 * Re-export from `/src/schemas/quiz.schema.ts` for backward compatibility
 * The Zod-based schemas provide better validation, automatic JSON schema generation,
 * and type inference.
 * 
 * Migration notes:
 * - GeneratedQuiz is now z.infer<typeof GeneratedQuizSchema>
 * - All field descriptions are in Zod, flowing to JSON schemas and LLM prompts
 * - TypeScript types automatically update when schema changes
 */

import type { GeneratedQuiz } from '../../../schemas/quiz.schema'

// Re-export all quiz types from the new schemas location
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
} from '../../../schemas/quiz.schema'

/**
 * These types are still defined here for reference but are no longer the source of truth
 */
export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface QuizPreview {
  totalQuestions: number
  difficultyDistribution: {
    easy: number
    medium: number
    hard: number
  }
  estimatedCompletionTime: string
  pointsTotal: number
}

export interface QuizSelection {
  category: string
  subcategory: string
  topic: string
  lessonId: string
  lessonVersion: number
  easyCount?: number
  mediumCount?: number
  hardCount?: number
  customInstructions?: string
}

export interface QuizCustomization {
  easyCount: number
  mediumCount: number
  hardCount: number
  instructions: string
  additionalNotes?: string
}

export interface StoredQuiz {
  id: string
  filename: string
  category: string
  subcategory: string
  topic: string
  lessonVersion: number
  content: GeneratedQuiz
  savedAt: string
}
