/**
 * Zod schemas for quiz generation
 * Single source of truth for quiz structure and validation
 */

import { z } from 'zod'

/**
 * Question types supported by quiz generator
 */
export const QuestionTypeSchema = z.enum(['multiple-choice', 'true-false', 'short-answer']).describe(
  'Question type: multiple-choice (4 options), true-false (2 options), or short-answer (text response)'
)

/**
 * Difficulty levels for quiz questions
 */
export const DifficultyLevelSchema = z.enum(['easy', 'medium', 'hard']).describe(
  'Question difficulty: easy (recall), medium (comprehension), hard (application/analysis)'
)

/**
 * Individual quiz question
 */
export const QuizQuestionSchema = z.object({
  id: z.string().describe('Unique question identifier'),
  type: QuestionTypeSchema,
  question: z.string().describe('The question text or prompt'),
  options: z.array(z.string()).optional().describe(
    'Answer options (required for multiple-choice and true-false; should have 4 items for MC, 2 for T/F)'
  ),
  correctAnswer: z.union([z.string(), z.number()]).describe('The correct answer (option text or index for short-answer)'),
  explanation: z.string().describe('Detailed explanation of why this is correct, for student learning'),
  difficulty: DifficultyLevelSchema,
  points: z.number().int().positive().describe('Points awarded for correct answer')
})

/**
 * Quiz metadata - contextual information
 */
export const QuizMetadataSchema = z.object({
  totalQuestions: z.number().int().min(1).describe('Total number of questions in this quiz'),
  createdAt: z.string().datetime().describe('ISO 8601 timestamp when quiz was generated'),
  lessonId: z.string().describe('Reference to the lesson this quiz covers')
})

/**
 * Full generated quiz with questions and metadata
 * This is what the LLM generates
 */
export const GeneratedQuizSchema = z.object({
  title: z.string().describe('Descriptive quiz title (e.g., "French Numbers Quiz - Beginner")'),
  lesson_id: z.string().describe('Unique identifier of the associated lesson'),
  quiz_version: z.number().int().positive().describe('Version number of this quiz (1, 2, 3, ...)'),
  questions: z.array(QuizQuestionSchema).min(1).describe('Array of quiz questions'),
  metadata: QuizMetadataSchema
})

/**
 * Export types inferred from Zod schemas for TypeScript usage
 */
export type GeneratedQuiz = z.infer<typeof GeneratedQuizSchema>
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>
export type QuizMetadata = z.infer<typeof QuizMetadataSchema>

/**
 * Default values for quiz generation
 */
export const QuizDefaults = {
  easyCount: 30,
  mediumCount: 30,
  hardCount: 30,
  pointsPerQuestion: 1
} as const
