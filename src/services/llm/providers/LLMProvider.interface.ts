/**
 * LLM Provider interface
 * Defines the contract for LLM provider implementations
 * This allows for easy addition of new providers (Claude, GPT-4, etc.)
 */

import type { LLMProviderConfig, LLMMessage, LLMResponse, LLMRequestOptions, LLMConnectionTest } from '../types'

export interface ILLMProvider {
  /**
   * Provider name (e.g., 'openrouter', 'claude', 'gpt-4')
   */
  name: string

  /**
   * Initialize provider with configuration
   */
  initialize(config: LLMProviderConfig): Promise<void>

  /**
   * Test connection to LLM provider
   */
  testConnection(): Promise<LLMConnectionTest>

  /**
   * Send a message to the LLM and get a response
   */
  sendMessage(messages: LLMMessage[], options?: LLMRequestOptions): Promise<LLMResponse>

  /**
   * Send a message with streaming support
   */
  sendMessageStream(
    messages: LLMMessage[],
    onChunk: (chunk: string) => void,
    options?: LLMRequestOptions
  ): Promise<void>

  /**
   * Validate that the provider is properly configured
   */
  isConfigured(): boolean

  /**
   * Get supported models for this provider
   */
  getSupportedModels(): string[]

  /**
   * Get current model being used
   */
  getCurrentModel(): string

  /**
   * Set the model to use
   */
  setModel(model: string): void

  /**
   * Get provider-specific configuration
   */
  getConfig(): LLMProviderConfig
}
