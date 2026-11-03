/**
 * Zod schemas for lesson generation
 * Single source of truth for lesson structure and validation
 */

import { z } from 'zod'

/**
 * Lesson difficulty levels
 */
export const LessonDifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']).describe(
  'Difficulty level: beginner (9-12 years), intermediate (13-18 years), advanced (18+ years)'
)

/**
 * Lesson frontmatter - metadata fields written to YAML
 */
export const LessonFrontmatterSchema = z.object({
  title: z.string().describe('Clear, descriptive lesson title (e.g., "Introduction to French Numbers 0-10")'),
  summary: z.string().describe('Brief one-line summary of what the lesson covers'),
  duration: z.string().describe('Estimated time to complete (e.g., "30-45 minutes")'),
  active: z.boolean().default(true).describe('Whether this lesson is published and active'),
  difficulty: LessonDifficultySchema,
  learningObjectives: z.array(z.string()).min(1).describe(
    'Key outcomes students should achieve (e.g., "Pronounce numbers 0-10 correctly")'
  ),
  tags: z.array(z.string()).describe('Keywords for categorization (e.g., ["beginner", "numbers", "vocabulary"])'),
  createdAt: z.string().datetime().optional().describe('ISO 8601 timestamp when lesson was created'),
  category: z.string().optional().describe('Content category (e.g., "spoken-languages")'),
  subcategory: z.string().optional().describe('Subcategory (e.g., "french")'),
  topic: z.string().optional().describe('Specific topic (e.g., "numbers")')
})

/**
 * Full generated lesson with frontmatter + content
 * This is what the LLM generates
 */
export const GeneratedLessonSchema = LessonFrontmatterSchema.extend({
  content: z.string().describe(
    'Full markdown content with all lesson material. Supports headings, tables, code blocks, lists, blockquotes, links, and inline formatting. No images.'
  )
})

/**
 * Age group type for lesson targeting
 */
export const AgeGroupSchema = z.enum(['5-8 years', '9-12 years', '13-18 years', '18+ years']).describe(
  'Target age group for the lesson'
)

/**
 * Lesson metadata - contextual information
 */
export const LessonMetadataSchema = z.object({
  ageGroup: AgeGroupSchema,
  language: z.string().describe('Language being taught (e.g., "French", "Spanish")'),
  createdAt: z.string().datetime().describe('ISO 8601 timestamp'),
  category: z.string().describe('Content category (e.g., "spoken-languages")'),
  subcategory: z.string().describe('Subcategory (e.g., "french")'),
  topic: z.string().describe('Specific topic (e.g., "numbers-0-10")')
})

/**
 * Export type inferred from Zod schema for TypeScript usage
 */
export type GeneratedLesson = z.infer<typeof GeneratedLessonSchema>
export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>
export type LessonMetadata = z.infer<typeof LessonMetadataSchema>

/**
 * Default values for lesson generation
 */
export const LessonDefaults = {
  active: true,
  tags: ['generated', 'lesson'],
  learningObjectives: []
} as const
