/**
 * OpenRouter LLM Provider Implementation
 * Provides access to multiple LLM models via the OpenRouter API
 * 
 * OpenRouter documentation: https://openrouter.ai/docs
 */

import type { ILLMProvider } from './LLMProvider.interface'
import type {
  LLMProviderConfig,
  LLMMessage,
  LLMRequestOptions,
  LLMResponse,
  LLMConnectionTest,
} from '../types'

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1'
const DEFAULT_MODEL = 'meta-llama/llama-2-70b-chat'

/**
 * OpenRouter LLM Provider
 * Supports multiple models: Llama 2, Mistral, GPT-4, Claude, etc.
 */
export class OpenRouterProvider implements ILLMProvider {
  private config: LLMProviderConfig
  private currentModel: string = DEFAULT_MODEL
  private supportedModels: string[] = [
    'meta-llama/llama-2-70b-chat',
    'mistralai/mistral-7b-instruct',
    'openai/gpt-4',
    'openai/gpt-3.5-turbo',
    'anthropic/claude-2',
  ]

  constructor(config: LLMProviderConfig) {
    this.config = config
    // Allow any model name, not just the pre-approved list
    if (config.model) {
      this.currentModel = config.model
    }
  }

  /**
   * Test connection by making a lightweight API call
   */
  async testConnection(): Promise<LLMConnectionTest> {
    const startTime = Date.now()

    try {
      if (!this.config.apiKey) {
        return {
          success: false,
          message: 'API key is not configured',
          provider: 'OpenRouter',
          timestamp: new Date().toISOString(),
        }
      }

      // Simple test: request with minimal tokens
      const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173',
          'X-Title': 'Language Learning Dev Tool',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.currentModel,
          messages: [
            {
              role: 'user',
              content: 'Respond with just the word: test',
            },
          ],
          max_tokens: 10,
          temperature: 0,
        }),
      })

      const latency = Date.now() - startTime

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData?.error?.message || `HTTP ${response.status}`

        return {
          success: false,
          message: `Connection failed: ${errorMessage}`,
          provider: 'OpenRouter',
          timestamp: new Date().toISOString(),
          latency,
        }
      }

      const data = await response.json()

      // Verify response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return {
          success: false,
          message: 'Invalid response format from OpenRouter',
          provider: 'OpenRouter',
          timestamp: new Date().toISOString(),
          latency,
        }
      }

      return {
        success: true,
        message: `Connected successfully to OpenRouter (${this.currentModel})`,
        provider: 'OpenRouter',
        timestamp: new Date().toISOString(),
        latency,
      }
    } catch (error) {
      const latency = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        success: false,
        message: `Connection error: ${errorMessage}`,
        provider: 'OpenRouter',
        timestamp: new Date().toISOString(),
        latency,
      }
    }
  }

  /**
   * Send a message to OpenRouter API
   */
  async sendMessage(
    messages: LLMMessage[],
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    try {
      const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173',
          'X-Title': 'Language Learning Dev Tool',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.currentModel,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 64000,
          top_p: options?.topP ?? 1.0,
          frequency_penalty: options?.frequencyPenalty ?? 0,
          presence_penalty: options?.presencePenalty ?? 0,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData?.error?.message || `HTTP ${response.status}`

        throw new Error(`OpenRouter API error: ${errorMessage}`)
      }

      const data = await response.json()

      return {
        content: data.choices[0].message.content,
        model: data.model,
        tokensUsed: {
          input: data.usage?.prompt_tokens || 0,
          output: data.usage?.completion_tokens || 0,
          total: data.usage?.total_tokens || 0,
        },
        finishReason: this.mapFinishReason(data.choices[0].finish_reason),
      }
    } catch (error) {
      throw new Error(
        `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Send message with streaming (not fully implemented for browser context)
   */
  async sendMessageStream(
    messages: LLMMessage[],
    onChunk: (chunk: string) => void,
    options?: LLMRequestOptions
  ): Promise<void> {
    // Streaming is more complex in browser; for now, fall back to regular sendMessage
    const response = await this.sendMessage(messages, options)
    onChunk(response.content)
  }

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.trim().length > 0
  }

  /**
   * Get supported models
   */
  getSupportedModels(): string[] {
    return this.supportedModels
  }

  /**
   * Get current model
   */
  getCurrentModel(): string {
    return this.currentModel
  }

  /**
   * Set model to use
   */
  setModel(model: string): void {
    if (this.supportedModels.includes(model)) {
      this.currentModel = model
    } else {
      throw new Error(`Unsupported model: ${model}`)
    }
  }

  /**
   * Get provider configuration
   */
  getConfig(): LLMProviderConfig {
    return { ...this.config }
  }

  /**
   * Provider name for display
   */
  get name(): string {
    return 'OpenRouter'
  }

  /**
   * Initialize provider (for OpenRouter, minimal initialization needed)
   */
  async initialize(config: LLMProviderConfig): Promise<void> {
    this.config = config
    // Allow any model name, not just the pre-approved list
    if (config.model) {
      this.currentModel = config.model
    }
  }

  /**
   * Map OpenRouter finish_reason to standard enum
   */
  private mapFinishReason(
    reason: string
  ): 'stop' | 'length' | 'error' {
    switch (reason) {
      case 'stop':
        return 'stop'
      case 'length':
        return 'length'
      default:
        return 'error'
    }
  }
}
