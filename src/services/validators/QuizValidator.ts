/**
 * Quiz Validator
 * Validates generated quizzes against business rules
 * Phase 8.6
 */

import type { GeneratedQuiz } from '@/schemas'

export interface QuizValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
  questionIndex?: number
}

export class QuizValidator {
  /**
   * Validate quiz structure and questions
   */
  static validate(quiz: GeneratedQuiz): QuizValidationError[] {
    const errors: QuizValidationError[] = []

    // Validate title
    if (!quiz.title || quiz.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Title is required',
        severity: 'error',
      })
    }

    // Validate lesson_id
    if (!quiz.lesson_id) {
      errors.push({
        field: 'lesson_id',
        message: 'Lesson ID is required',
        severity: 'error',
      })
    }

    // Validate quiz_version
    if (!quiz.quiz_version || quiz.quiz_version < 1) {
      errors.push({
        field: 'quiz_version',
        message: 'Quiz version must be at least 1',
        severity: 'error',
      })
    }

    // Validate questions array
    if (!Array.isArray(quiz.questions)) {
      errors.push({
        field: 'questions',
        message: 'Questions must be an array',
        severity: 'error',
      })
      return errors
    }

    if (quiz.questions.length === 0) {
      errors.push({
        field: 'questions',
        message: 'At least one question is required',
        severity: 'error',
      })
      return errors
    }

    if (quiz.questions.length > 100) {
      errors.push({
        field: 'questions',
        message: 'Too many questions (max 100)',
        severity: 'warning',
      })
    }

    // Validate each question
    const questionErrors = this.validateQuestions(quiz.questions)
    errors.push(...questionErrors)

    // Validate question distribution
    const easyCount = quiz.questions.filter((q) => q.difficulty === 'easy').length
    const mediumCount = quiz.questions.filter((q) => q.difficulty === 'medium').length
    const hardCount = quiz.questions.filter((q) => q.difficulty === 'hard').length

    if (easyCount === 0 && mediumCount === 0 && hardCount === 0) {
      errors.push({
        field: 'questions',
        message: 'No questions with valid difficulty levels',
        severity: 'error',
      })
    }

    return errors
  }

  /**
   * Validate individual questions
   */
  private static validateQuestions(questions: any[]): QuizValidationError[] {
    const errors: QuizValidationError[] = []

    questions.forEach((question, idx) => {
      const base = `questions[${idx}]`

      // Validate id
      if (!question.id) {
        errors.push({
          field: `${base}.id`,
          message: 'Question ID is required',
          severity: 'error',
          questionIndex: idx,
        })
      }

      // Validate type
      const validTypes = ['multiple-choice', 'short-answer', 'true-false']
      if (!validTypes.includes(question.type)) {
        errors.push({
          field: `${base}.type`,
          message: `Type must be one of: ${validTypes.join(', ')}`,
          severity: 'error',
          questionIndex: idx,
        })
      }

      // Validate question text
      if (!question.question || question.question.trim().length === 0) {
        errors.push({
          field: `${base}.question`,
          message: 'Question text is required',
          severity: 'error',
          questionIndex: idx,
        })
      }

      // Validate difficulty
      const validDifficulties = ['easy', 'medium', 'hard']
      if (!validDifficulties.includes(question.difficulty)) {
        errors.push({
          field: `${base}.difficulty`,
          message: `Difficulty must be one of: ${validDifficulties.join(', ')}`,
          severity: 'error',
          questionIndex: idx,
        })
      }

      // Validate points
      if (typeof question.points !== 'number' || question.points <= 0) {
        errors.push({
          field: `${base}.points`,
          message: 'Points must be a positive number',
          severity: 'error',
          questionIndex: idx,
        })
      }

      // Validate correctAnswer
      if (question.correctAnswer === undefined || question.correctAnswer === null) {
        errors.push({
          field: `${base}.correctAnswer`,
          message: 'Correct answer is required',
          severity: 'error',
          questionIndex: idx,
        })
      }

      // Validate explanation
      if (!question.explanation || question.explanation.trim().length === 0) {
        errors.push({
          field: `${base}.explanation`,
          message: 'Explanation is required',
          severity: 'error',
          questionIndex: idx,
        })
      }

      // Validate options for multiple-choice
      if (question.type === 'multiple-choice') {
        if (!Array.isArray(question.options) || question.options.length === 0) {
          errors.push({
            field: `${base}.options`,
            message: 'Multiple-choice questions must have at least one option',
            severity: 'error',
            questionIndex: idx,
          })
        } else if (question.options.length < 2) {
          errors.push({
            field: `${base}.options`,
            message: 'Multiple-choice questions should have at least 2 options',
            severity: 'warning',
            questionIndex: idx,
          })
        } else if (question.options.length > 10) {
          errors.push({
            field: `${base}.options`,
            message: 'Too many options (max 10)',
            severity: 'warning',
            questionIndex: idx,
          })
        }

        // Validate correctAnswer is within options
        if (
          typeof question.correctAnswer === 'number' &&
          (question.correctAnswer < 0 || question.correctAnswer >= question.options.length)
        ) {
          errors.push({
            field: `${base}.correctAnswer`,
            message: 'Correct answer index is out of range',
            severity: 'error',
            questionIndex: idx,
          })
        }
      }
    })

    return errors
  }

  /**
   * Get all error messages
   */
  static getErrorMessages(errors: QuizValidationError[]): string[] {
    return errors.map((e) => {
      const suffix = e.questionIndex !== undefined ? ` (Question ${e.questionIndex + 1})` : ''
      return `[${e.field}] ${e.message}${suffix}`
    })
  }

  /**
   * Check if validation passed (no errors, only warnings allowed)
   */
  static isValid(errors: QuizValidationError[]): boolean {
    return !errors.some((e) => e.severity === 'error')
  }
}
