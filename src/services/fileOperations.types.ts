/**
 * File system query parameters
 */
export interface FileSystemQuery {
  type: 'categories' | 'subcategories' | 'topics'
  category?: string
  subcategory?: string
}

/**
 * Lesson file data structure
 */
export interface LessonFileData {
  title: string
  summary: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  learningObjectives?: string[]
  tags?: string[]
  content: string
  metadata: {
    createdAt: string
    category: string
    subcategory: string
    topic: string
  }
}

/**
 * Quiz question structure
 */
export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number | string
  explanation: string
  points: number
}

/**
 * Quiz file data structure
 */
export interface QuizFileData {
  title: string
  summary: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questions: QuizQuestion[]
  metadata: {
    createdAt: string
    lessonVersion: string
    category: string
    subcategory: string
    topic: string
  }
}

/**
 * Generic operation result
 */
export interface OperationResult<T> {
  success: boolean
  data?: T
  error?: string
  filePath?: string
}
