/**
 * Lesson Validator
 * Validates generated lessons against business rules
 * Phase 8.6
 */

import type { GeneratedLesson } from '@/schemas'

export interface LessonValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export class LessonValidator {
  /**
   * Validate lesson content and structure
   */
  static validate(lesson: GeneratedLesson): LessonValidationError[] {
    const errors: LessonValidationError[] = []

    // Validate title
    if (!lesson.title || lesson.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Title is required and cannot be empty',
        severity: 'error',
      })
    } else if (lesson.title.length < 3) {
      errors.push({
        field: 'title',
        message: 'Title should be at least 3 characters',
        severity: 'warning',
      })
    } else if (lesson.title.length > 200) {
      errors.push({
        field: 'title',
        message: 'Title is too long (max 200 characters)',
        severity: 'error',
      })
    }

    // Validate summary
    if (!lesson.summary || lesson.summary.trim().length === 0) {
      errors.push({
        field: 'summary',
        message: 'Summary is required',
        severity: 'error',
      })
    } else if (lesson.summary.length < 20) {
      errors.push({
        field: 'summary',
        message: 'Summary should be at least 20 characters',
        severity: 'warning',
      })
    }

    // Validate duration
    if (!lesson.duration || lesson.duration.trim().length === 0) {
      errors.push({
        field: 'duration',
        message: 'Duration is required',
        severity: 'error',
      })
    }

    // Validate difficulty
    const validDifficulties = ['beginner', 'intermediate', 'advanced']
    if (!validDifficulties.includes(lesson.difficulty)) {
      errors.push({
        field: 'difficulty',
        message: `Difficulty must be one of: ${validDifficulties.join(', ')}`,
        severity: 'error',
      })
    }

    // Validate learning objectives
    if (!Array.isArray(lesson.learningObjectives)) {
      errors.push({
        field: 'learningObjectives',
        message: 'Learning objectives must be an array',
        severity: 'error',
      })
    } else if (lesson.learningObjectives.length === 0) {
      errors.push({
        field: 'learningObjectives',
        message: 'At least one learning objective is required',
        severity: 'error',
      })
    } else if (lesson.learningObjectives.length > 10) {
      errors.push({
        field: 'learningObjectives',
        message: 'Too many learning objectives (max 10)',
        severity: 'warning',
      })
    }

    // Validate tags
    if (!Array.isArray(lesson.tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags must be an array',
        severity: 'error',
      })
    } else if (lesson.tags.length === 0) {
      errors.push({
        field: 'tags',
        message: 'At least one tag is recommended',
        severity: 'warning',
      })
    }

    // Validate content
    if (!lesson.content || lesson.content.trim().length === 0) {
      errors.push({
        field: 'content',
        message: 'Lesson content is required',
        severity: 'error',
      })
    } else if (lesson.content.length < 100) {
      errors.push({
        field: 'content',
        message: 'Lesson content is too short (min 100 characters)',
        severity: 'warning',
      })
    }

    return errors
  }

  /**
   * Get all error messages
   */
  static getErrorMessages(errors: LessonValidationError[]): string[] {
    return errors.map((e) => `[${e.field}] ${e.message}`)
  }

  /**
   * Check if validation passed (no errors, only warnings allowed)
   */
  static isValid(errors: LessonValidationError[]): boolean {
    return !errors.some((e) => e.severity === 'error')
  }
}
