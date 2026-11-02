/**
 * LLM Settings Tab Component
 * Allows user to configure LLM provider and API key
 * Phase 8.3 - Integrated with Context
 */

import { useState } from 'react'
import { useLLMSettings } from '../hooks/useLLMSettings'

export interface LLMSettingsFormState {
  provider: string
  apiKey: string
}

interface LLMSettingsTabProps {
  onSettingsChange?: (settings: LLMSettingsFormState) => void
}

export function LLMSettingsTab(props: LLMSettingsTabProps) {
  const { settings, updateApiKey, updateProvider, setConnected } = useLLMSettings()
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle')
  const [connectionError, setConnectionError] = useState<string>('')

  const providers = [
    { id: 'openrouter', name: 'OpenRouter', description: 'Access to multiple LLM models via OpenRouter' },
    { id: 'claude', name: 'Claude (Future)', description: 'Direct Claude API integration', disabled: true },
    { id: 'gpt4', name: 'GPT-4 (Future)', description: 'Direct OpenAI GPT-4 integration', disabled: true },
  ]

  const handleTestConnection = async () => {
    if (!settings.apiKey.trim()) {
      setConnectionError('API key is required')
      setConnectionStatus('failed')
      return
    }

    setConnectionStatus('testing')
    setConnectionError('')

    // TODO: Phase 8.4 - Implement actual connection test via LLM service
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setConnectionStatus('connected')
      setConnectionError('')
      setConnected(true)
      if (props.onSettingsChange) {
        props.onSettingsChange({ provider: settings.provider, apiKey: settings.apiKey })
      }
    } catch (error) {
      setConnectionStatus('failed')
      setConnectionError(error instanceof Error ? error.message : 'Connection failed')
      setConnected(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">LLM Provider Configuration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose an LLM provider and configure your API key
        </p>
      </div>

      {/* Provider Selector */}
      <div className="space-y-2">
        <label htmlFor="provider" className="text-sm font-medium">
          LLM Provider
        </label>
        <select
          id="provider"
          value={settings.provider}
          onChange={(e) => updateProvider(e.target.value)}
          style={{
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id} disabled={p.disabled}>
              {p.name} {p.disabled ? '(Coming soon)' : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {providers.find(p => p.id === settings.provider)?.description}
        </p>
      </div>

      {/* API Key Input */}
      <div className="space-y-2">
        <label htmlFor="apiKey" className="text-sm font-medium">
          API Key
        </label>
        <input
          id="apiKey"
          type="password"
          placeholder="Enter your API key"
          value={settings.apiKey}
          onChange={(e) => updateApiKey(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm placeholder-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Your API key is stored in local browser storage. Never share it publicly.
        </p>
      </div>

      {/* Connection Test */}
      <div className="space-y-2">
        <div className="flex justify-end pt-2">
          <button
            onClick={handleTestConnection}
            disabled={connectionStatus === 'testing' || !settings.apiKey.trim()}
            style={{
              backgroundColor: 'hsl(238 92% 66%)',
              color: 'hsl(0 0% 100%)',
            }}
            className="px-6 py-2 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {connectionStatus === 'testing' ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin">⟳</span>
                Testing...
              </span>
            ) : (
              'Test Connection'
            )}
          </button>
        </div>

        {connectionStatus === 'connected' && (
          <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md flex items-center gap-2">
            <span className="text-green-700 dark:text-green-300 text-lg">✓</span>
            <span className="text-sm text-green-900 dark:text-green-100">
              Connection successful! Settings saved to local storage.
            </span>
          </div>
        )}

        {connectionStatus === 'failed' && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2">
            <span className="text-red-600 dark:text-red-400 text-lg">✕</span>
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-medium">Connection failed</p>
              {connectionError && <p className="text-xs mt-1">{connectionError}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> This tab configuration is saved to your browser's local storage. 
          It will persist across page reloads and browser sessions.
        </p>
      </div>
    </div>
  )
}
