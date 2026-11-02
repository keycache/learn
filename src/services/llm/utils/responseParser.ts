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
 * Fix common JSON issues from LLM responses
 * - Replace literal newlines/tabs with escaped versions
 * - Handle control characters in string values
 */
function fixJsonString(jsonStr: string): string {
  let result = ''
  let inString = false
  let escaped = false

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i]
    const prevChar = i > 0 ? jsonStr[i - 1] : ''

    if (escaped) {
      result += char
      escaped = false
      continue
    }

    if (char === '\\') {
      result += char
      escaped = true
      continue
    }

    if (char === '"' && prevChar !== '\\') {
      inString = !inString
      result += char
      continue
    }

    // Inside string: replace unescaped control characters
    if (inString) {
      if (char === '\n') {
        result += '\\n'
      } else if (char === '\r') {
        result += '\\r'
      } else if (char === '\t') {
        result += '\\t'
      } else if (char.charCodeAt(0) < 32) {
        // Other control characters
        result += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
      } else {
        result += char
      }
    } else {
      result += char
    }
  }

  // If we ended while inside a string, try to close it
  if (inString) {
    result += '"'
  }

  // Try to close unclosed object/array structures
  let openBraces = 0
  let openBrackets = 0
  let inStr = false
  let isEscaped = false

  for (const ch of result) {
    if (isEscaped) {
      isEscaped = false
      continue
    }
    if (ch === '\\') {
      isEscaped = true
      continue
    }
    if (ch === '"') {
      inStr = !inStr
      continue
    }
    if (!inStr) {
      if (ch === '{') openBraces++
      else if (ch === '}') openBraces--
      else if (ch === '[') openBrackets++
      else if (ch === ']') openBrackets--
    }
  }

  // Close any unclosed arrays
  while (openBrackets > 0) {
    result += ']'
    openBrackets--
  }

  // Close any unclosed objects
  while (openBraces > 0) {
    result += '}'
    openBraces--
  }

  return result
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
    let jsonStr = jsonMatch ? jsonMatch[0] : response

    // Fix common issues with LLM-generated JSON
    // Replace unescaped newlines and tabs in string values
    jsonStr = fixJsonString(jsonStr)

    jsonData = JSON.parse(jsonStr)

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

    // Debug: Check if content has proper newlines (not escaped)
    if (typeof window !== 'undefined' && result.data.content) {
      const hasEscapedNewlines = result.data.content.includes('\\n')
      const hasRealNewlines = result.data.content.includes('\n')
      console.log('[DEBUG] Lesson content after parsing:', {
        hasEscapedNewlines,
        hasRealNewlines,
        contentLength: result.data.content.length,
        first300chars: result.data.content.substring(0, 300),
      })
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
    let jsonStr = jsonMatch ? jsonMatch[0] : response

    // Fix common issues with LLM-generated JSON
    jsonStr = fixJsonString(jsonStr)

    jsonData = JSON.parse(jsonStr)

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
