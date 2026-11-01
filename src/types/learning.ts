export interface Category {
  id: string // e.g., "spoken-languages"
  name: string
  description: string
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: string // e.g., "french"
  name: string
  description: string
  category: string
  topics?: TopicInfo[] // topic metadata without questions
  version?: string
  createdAt?: string
}

export interface TopicInfo {
  id: string
  name: string
}

/**
 * YAML frontmatter metadata for lessons
 * Extracted from markdown files and used for lesson metadata
 */
export interface LessonMetadata {
  title: string
  summary: string
  duration: string // e.g., "5-10 minutes"
  active: boolean
  difficulty: "beginner" | "intermediate" | "advanced"
  learningObjectives: string[]
  tags: string[]
}

/**
 * Lesson with metadata (content loaded lazily)
 * Used for displaying lesson tabs and progress
 */
export interface Lesson extends LessonMetadata {
  id: string // e.g., "lesson_1" (derived from filename)
  order: number // numeric order (derived from filename, 1-indexed)
  content?: string // raw markdown content (lazy-loaded, not included by default)
  htmlContent?: string // cached rendered HTML (lazy-loaded, computed on demand)
}

/**
 * Lazy-loaded markdown content with parsed metadata
 * Used when loading lesson content for display
 */
export interface MarkdownContent {
  metadata: LessonMetadata
  content: string // raw markdown without frontmatter
}

export interface Topic {
  id: string // e.g., "numbers"
  name: string
  description: string
  category: string
  subcategory: string
  lessons?: Lesson[] // optional lessons (auto-discovered from topic folder)
  levels: {
    easy: Level
    medium: Level
    hard: Level
  }
}

export interface Level {
  level: "easy" | "medium" | "hard"
  description?: string
  questionCount?: number
  questions: Question[]
}

export interface Question {
  id: string
  text: string
  options: Option[]
  correctAnswers: string[] // option IDs
  explanation?: string
}

export interface Option {
  id: string
  text: string
}

export interface Progress {
  [key: string]: QuestionProgress // key: "category.subcategory.topic.level.questionId"
}

export interface QuestionProgress {
  attempts: number
  wrong: number
}

export interface Quiz {
  category: string
  subcategory: string
  topic: string
  level: "easy" | "medium" | "hard"
  questions: Question[]
  userAnswers: Map<string, string[]> // questionId -> selectedOptionIds
}

export interface QuizResults {
  score: number
  total: number
  percentage: number
  wrongQuestions: WrongQuestion[]
}

export interface WrongQuestion {
  questionId: string
  text: string
  userAnswers: string[]
  correctAnswers: string[]
  wrongAttempts: number
  explanation: string
}
