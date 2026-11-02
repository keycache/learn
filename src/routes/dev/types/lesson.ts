/**
 * Lesson types for dev generator
 * These types are used when generating lessons via LLM
 * 
 * Lessons are stored as Markdown files with YAML frontmatter.
 * The LLM generates output in a structured format that separates
 * frontmatter (metadata) from the markdown content body.
 */

export type AgeGroup = '5-8 years' | '9-12 years' | '13-18 years' | '18+ years'
export type LessonDuration = '15 minutes' | '30 minutes' | '45 minutes' | '60 minutes'
export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced'

/**
 * Frontmatter metadata for lesson files
 * These fields will be written to the YAML section at the top of the markdown file
 */
export interface LessonFrontmatter {
  title: string
  summary: string
  duration: string // e.g., "30-45 minutes"
  active: boolean
  difficulty: LessonDifficulty
  learningObjectives: string[] // Core objectives users should achieve
  tags: string[] // Keywords for searchability and categorization
}

/**
 * Generated lesson structure from LLM
 * Combines frontmatter (YAML) with markdown content body
 * 
 * Markdown Capabilities:
 * The lesson content supports all major markdown features:
 * - Headings (#, ##, ###, etc.)
 * - Tables (|---|---|)
 * - Code blocks (```language ... ```)
 * - Lists (- item, 1. numbered)
 * - Blockquotes (> text)
 * - Links and inline formatting (**bold**, *italic*)
 * - Callouts and highlights (> **Note**: text)
 * 
 * Note: Images are not supported. Use descriptions or links instead.
 * 
 * The LLM should be instructed to use these features naturally
 * when they enhance learning (e.g., tables for comparing concepts,
 * code blocks for language examples, lists for step-by-step instructions).
 */
export interface GeneratedLesson {
  // Frontmatter fields
  title: string
  summary: string
  duration: string
  active: boolean
  difficulty: LessonDifficulty
  learningObjectives: string[]
  tags: string[]
  
  // Markdown content body
  content: string // Full markdown content with all formatting
}

/**
 * Metadata about the generated lesson
 */
export interface LessonMetadata {
  ageGroup: AgeGroup
  language: string
  createdAt: string // ISO 8601
  category: string
  subcategory: string
  topic: string
}

/**
 * File-system lesson with versioning info
 */
export interface StoredLesson {
  id: string
  version: number
  filename: string // e.g., "lesson-v1.md" or "lesson_1.md"
  category: string
  subcategory: string
  topic: string
  content: GeneratedLesson
  savedAt: string // ISO 8601
}

/**
 * Selection state for lesson generation
 */
export interface LessonSelection {
  category: string
  subcategory: string
  topic: string
  ageGroup?: AgeGroup
  customInstructions?: string // User-provided custom instructions for the LLM
}

/**
 * Form state for lesson generation UI
 */
export interface LessonGenerationForm extends LessonSelection {
  ageGroup: AgeGroup
  customInstructions: string
}
