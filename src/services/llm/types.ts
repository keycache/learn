/**
 * LLM service types
 * Defines interfaces for LLM providers and API interactions
 */

export interface LLMProviderConfig {
  name: string
  apiKey: string
  baseUrl?: string
  model?: string
  timeout?: number
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMRequestOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export interface LLMResponse {
  content: string
  model: string
  tokensUsed: {
    input: number
    output: number
    total: number
  }
  finishReason: 'stop' | 'length' | 'error'
}

export interface LLMConnectionTest {
  success: boolean
  message: string
  provider: string
  timestamp: string
  latency?: number // milliseconds
}

export interface LLMGenerationTask {
  id: string
  provider: string
  task: 'lesson' | 'quiz'
  status: 'pending' | 'generating' | 'validating' | 'completed' | 'failed'
  progress: number // 0-100
  startedAt: string // ISO 8601
  completedAt?: string // ISO 8601
  result?: unknown // Lesson or Quiz type
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  version: string
  systemPrompt: string
  userPrompt: string // Contains placeholders like {{category}}, {{ageGroup}}, etc.
  schema?: unknown // JSON schema for validation
  createdAt: string
  updatedAt: string
}
