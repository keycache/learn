/**
 * LLM Provider Registry
 * Manages available LLM providers and provides factory functions
 */

import type { ILLMProvider } from './LLMProvider.interface'
import type { LLMProviderConfig } from '../types'
import { OpenRouterProvider } from './OpenRouterProvider'

export type ProviderName = 'openrouter' | 'claude' | 'gpt-4'

/**
 * Provider registry factory
 */
export class LLMProviderRegistry {
  /**
   * Get a provider instance by name
   */
  static getProvider(name: ProviderName, config: LLMProviderConfig): ILLMProvider {
    switch (name) {
      case 'openrouter':
        return new OpenRouterProvider(config)

      case 'claude':
        throw new Error('Claude provider coming soon in Phase 8.5')

      case 'gpt-4':
        throw new Error('GPT-4 provider coming soon in Phase 8.5')

      default:
        throw new Error(`Unknown provider: ${name}`)
    }
  }

  /**
   * Get list of available providers
   */
  static getAvailableProviders(): Array<{
    id: ProviderName
    name: string
    description: string
    available: boolean
  }> {
    return [
      {
        id: 'openrouter',
        name: 'OpenRouter',
        description: 'Access to multiple LLM models via OpenRouter API',
        available: true,
      },
      {
        id: 'claude',
        name: 'Claude (Coming Soon)',
        description: 'Direct Anthropic Claude API integration',
        available: false,
      },
      {
        id: 'gpt-4',
        name: 'GPT-4 (Coming Soon)',
        description: 'Direct OpenAI GPT-4 integration',
        available: false,
      },
    ]
  }

  /**
   * Check if provider is available
   */
  static isAvailable(name: ProviderName): boolean {
    const providers = this.getAvailableProviders()
    return providers.find(p => p.id === name)?.available ?? false
  }

  /**
   * Get provider info by name
   */
  static getProviderInfo(name: ProviderName) {
    const providers = this.getAvailableProviders()
    return providers.find(p => p.id === name)
  }
}
