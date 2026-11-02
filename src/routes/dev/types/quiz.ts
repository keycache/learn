/**
 * Quiz types for dev generator
 * These types are used when generating quizzes via LLM
 */

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  options?: string[] // Required for multiple-choice and true-false
  correctAnswer: string | number
  explanation: string
  difficulty: DifficultyLevel
  points: number
}

export interface QuizMetadata {
  totalQuestions: number
  createdAt: string // ISO 8601
  lessonId: string
}

export interface GeneratedQuiz {
  title: string
  lesson_id: string
  quiz_version: number
  questions: QuizQuestion[]
  metadata: QuizMetadata
}

/**
 * File-system quiz with versioning info
 */
export interface StoredQuiz {
  id: string
  filename: string // e.g., "quiz-v1.json"
  category: string
  subcategory: string
  topic: string
  lessonVersion: number
  content: GeneratedQuiz
  savedAt: string // ISO 8601
}

/**
 * Selection state for quiz generation
 */
export interface QuizSelection {
  category: string
  subcategory: string
  topic: string
  lessonId: string
  lessonVersion: number
  easyCount?: number // Default: 30
  mediumCount?: number // Default: 30
  hardCount?: number // Default: 30
  customInstructions?: string
}

/**
 * Quiz customization and counts
 */
export interface QuizCustomization {
  easyCount: number // Number of easy questions (default 30)
  mediumCount: number // Number of medium questions (default 30)
  hardCount: number // Number of hard questions (default 30)
  instructions: string // Required - user-provided custom instructions
  additionalNotes?: string
}

/**
 * Quiz preview data (before saving)
 */
export interface QuizPreview {
  totalQuestions: number
  difficultyDistribution: {
    easy: number
    medium: number
    hard: number
  }
  estimatedCompletionTime: string // e.g., "15-20 minutes"
  pointsTotal: number
}
