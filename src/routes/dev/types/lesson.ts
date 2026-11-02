/**
 * Lesson types for dev generator
 * These types are used when generating lessons via LLM
 */

export type AgeGroup = '5-8 years' | '9-12 years' | '13-18 years' | '18+ years'
export type LessonDuration = '15 minutes' | '30 minutes' | '45 minutes' | '60 minutes'

export interface LessonSection {
  title: string
  content: string // Markdown format
}

export interface LessonMetadata {
  ageGroup: AgeGroup
  duration: LessonDuration
  language: string
  createdAt: string // ISO 8601
}

export interface GeneratedLesson {
  title: string
  objectives: string[]
  sections: LessonSection[]
  keyTakeaways: string[]
  metadata: LessonMetadata
}

/**
 * File-system lesson with versioning info
 */
export interface StoredLesson {
  id: string
  version: number
  filename: string // e.g., "lesson-v1.md"
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
  duration?: LessonDuration
  customInstructions?: string
}

/**
 * Custom instructions for lesson generation
 */
export interface LessonCustomization {
  instructions: string // Required - user-provided custom instructions
  additionalNotes?: string
}
