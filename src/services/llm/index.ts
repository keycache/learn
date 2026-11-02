/**
 * LLM Service
 * Main service for generating lessons and quizzes
 * Handles provider management, request/response processing, and validation
 */

import type { ILLMProvider } from './providers/LLMProvider.interface'
import { LLMProviderRegistry } from './providers'
import type { LLMProviderConfig, LLMMessage, LLMRequestOptions } from './types'
import { parseLessonResponse, parseQuizResponse } from './utils/responseParser'
import type { GeneratedLesson, GeneratedQuiz } from '@/schemas'

export interface GenerateLessonParams {
  systemPrompt: string
  userPrompt: string
  options?: LLMRequestOptions
}

export interface GenerateQuizParams {
  systemPrompt: string
  userPrompt: string
  options?: LLMRequestOptions
}

export interface GenerationResult<T> {
  success: boolean
  data?: T
  error?: string
  validationErrors?: unknown
  rawResponse?: string
}

/**
 * Main LLM Service
 */
export class LLMService {
  private provider: ILLMProvider | null = null
  private config: LLMProviderConfig | null = null

  /**
   * Initialize service with a provider
   */
  async initialize(providerName: string, config: LLMProviderConfig): Promise<void> {
    this.config = config
    this.provider = LLMProviderRegistry.getProvider(providerName as any, config)
    await this.provider.initialize(config)
  }

  /**
   * Test connection to the configured provider
   */
  async testConnection() {
    if (!this.provider) {
      throw new Error('LLM provider not initialized')
    }

    return this.provider.testConnection()
  }

  /**
   * Generate a lesson
   */
  async generateLesson(params: GenerateLessonParams): Promise<GenerationResult<GeneratedLesson>> {
    if (!this.provider) {
      return {
        success: false,
        error: 'LLM provider not initialized',
      }
    }

    try {
      // Build messages
      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: params.systemPrompt,
        },
        {
          role: 'user',
          content: params.userPrompt,
        },
      ]

      // Send request
      const response = await this.provider.sendMessage(messages, params.options)

      // Parse response
      const parseResult = parseLessonResponse(response.content)

      if (!parseResult.success) {
        return {
          success: false,
          error: parseResult.error?.message || 'Failed to parse lesson response',
          validationErrors: parseResult.error?.details,
          rawResponse: parseResult.rawResponse,
        }
      }

      return {
        success: true,
        data: parseResult.data,
        rawResponse: parseResult.rawResponse,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during lesson generation',
      }
    }
  }

  /**
   * Generate a quiz
   */
  async generateQuiz(params: GenerateQuizParams): Promise<GenerationResult<GeneratedQuiz>> {
    if (!this.provider) {
      return {
        success: false,
        error: 'LLM provider not initialized',
      }
    }

    try {
      // Build messages
      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: params.systemPrompt,
        },
        {
          role: 'user',
          content: params.userPrompt,
        },
      ]

      // Send request
      const response = await this.provider.sendMessage(messages, params.options)

      // Parse response
      const parseResult = parseQuizResponse(response.content)

      if (!parseResult.success) {
        return {
          success: false,
          error: parseResult.error?.message || 'Failed to parse quiz response',
          validationErrors: parseResult.error?.details,
          rawResponse: parseResult.rawResponse,
        }
      }

      return {
        success: true,
        data: parseResult.data,
        rawResponse: parseResult.rawResponse,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during quiz generation',
      }
    }
  }

  /**
   * Get current provider name
   */
  getProviderName(): string {
    return this.provider?.name || 'Not initialized'
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.provider?.isConfigured() ?? false
  }

  /**
   * Get provider info
   */
  getProviderInfo() {
    if (!this.provider) {
      return null
    }

    return {
      name: this.provider.name,
      model: this.provider.getCurrentModel(),
      configured: this.provider.isConfigured(),
    }
  }
}

/**
 * Singleton instance for use throughout app
 */
let serviceInstance: LLMService | null = null

export function getLLMService(): LLMService {
  if (!serviceInstance) {
    serviceInstance = new LLMService()
  }
  return serviceInstance
}

/**
 * Reset service (useful for testing)
 */
export function resetLLMService(): void {
  serviceInstance = null
}
