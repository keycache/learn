/**
 * DEPRECATED: Lesson types have been migrated to Zod schemas
 * 
 * Re-export from `/src/schemas/lesson.schema.ts` for backward compatibility
 * The Zod-based schemas provide better validation, automatic JSON schema generation,
 * and type inference.
 * 
 * Migration notes:
 * - GeneratedLesson is now z.infer<typeof GeneratedLessonSchema>
 * - All field descriptions are in Zod, flowing to JSON schemas and LLM prompts
 * - TypeScript types automatically update when schema changes
 */

import type { GeneratedLesson } from '../../../schemas/lesson.schema'

// Re-export all lesson types from the new schemas location
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
} from '../../../schemas/lesson.schema'

/**
 * These types are still defined here for reference but are no longer the source of truth
 */
export type AgeGroup = '5-8 years' | '9-12 years' | '13-18 years' | '18+ years'
export type LessonDuration = '15 minutes' | '30 minutes' | '45 minutes' | '60 minutes'
export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface LessonSelection {
  category: string
  subcategory: string
  topic: string
  ageGroup?: AgeGroup
  customInstructions?: string
}

export interface LessonGenerationForm extends LessonSelection {
  ageGroup: AgeGroup
  customInstructions: string
}

export interface StoredLesson {
  id: string
  version: number
  filename: string
  category: string
  subcategory: string
  topic: string
  content: GeneratedLesson
  savedAt: string
}
