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

export interface Topic {
  id: string // e.g., "numbers"
  name: string
  description: string
  category: string
  subcategory: string
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
