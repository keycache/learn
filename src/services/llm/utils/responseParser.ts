/**
 * LLM Response Parser
 * Validates and parses LLM responses against expected schemas
 */

import { GeneratedLessonSchema } from '@/schemas'
import { GeneratedQuizSchema } from '@/schemas'
import type { GeneratedLesson, GeneratedQuiz } from '@/schemas'

export interface ParseResult<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    details?: unknown
  }
  rawResponse?: string
}

/**
 * Parse and validate lesson response from LLM
 */
export function parseLessonResponse(response: string): ParseResult<GeneratedLesson> {
  try {
    // Response should be valid JSON
    let jsonData: unknown

    // Try to extract JSON if response contains extra text
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonData = JSON.parse(jsonMatch[0])
    } else {
      jsonData = JSON.parse(response)
    }

    // Validate against Zod schema
    const result = GeneratedLessonSchema.safeParse(jsonData)

    if (!result.success) {
      return {
        success: false,
        error: {
          message: 'Response does not match lesson schema',
          details: result.error.issues,
        },
        rawResponse: response,
      }
    }

    return {
      success: true,
      data: result.data,
      rawResponse: response,
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      rawResponse: response,
    }
  }
}

/**
 * Parse and validate quiz response from LLM
 */
export function parseQuizResponse(response: string): ParseResult<GeneratedQuiz> {
  try {
    // Response should be valid JSON
    let jsonData: unknown

    // Try to extract JSON if response contains extra text
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonData = JSON.parse(jsonMatch[0])
    } else {
      jsonData = JSON.parse(response)
    }

    // Validate against Zod schema
    const result = GeneratedQuizSchema.safeParse(jsonData)

    if (!result.success) {
      return {
        success: false,
        error: {
          message: 'Response does not match quiz schema',
          details: result.error.issues,
        },
        rawResponse: response,
      }
    }

    return {
      success: true,
      data: result.data,
      rawResponse: response,
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      rawResponse: response,
    }
  }
}

/**
 * Extract JSON from a response that may contain extra text
 */
export function extractJSON(response: string): unknown {
  try {
    // Try to find JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    throw new Error(
      `Failed to extract JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Validate lesson data
 */
export function validateLesson(data: unknown): data is GeneratedLesson {
  const result = GeneratedLessonSchema.safeParse(data)
  return result.success
}

/**
 * Validate quiz data
 */
export function validateQuiz(data: unknown): data is GeneratedQuiz {
  const result = GeneratedQuizSchema.safeParse(data)
  return result.success
}

/**
 * Get human-readable validation errors
 */
export function getValidationErrorMessage(errors: unknown): string {
  if (Array.isArray(errors)) {
    return errors
      .map((err: any) => {
        if (err.path && err.message) {
          return `${err.path.join('.')}: ${err.message}`
        }
        return String(err)
      })
      .join('\n')
  }

  return String(errors)
}
