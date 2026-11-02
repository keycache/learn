/**
 * Validation Error Display Component
 * Shows detailed validation errors and recovery options
 * Phase 8.6
 */

import { useState } from 'react'

interface ValidationIssue {
  path: (string | number)[]
  message: string
  code: string
}

interface ValidationErrorDisplayProps {
  errorMessage: string
  validationErrors?: unknown[]
  rawResponse?: string
  onRetry?: () => void
  onViewRaw?: () => void
  isLoading?: boolean
}

export function ValidationErrorDisplay(props: ValidationErrorDisplayProps) {
  const [showRaw, setShowRaw] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Format validation issues from Zod errors
  const formatIssues = (errors: unknown[]): ValidationIssue[] => {
    return (errors as any[]).map((err) => ({
      path: err.path || [],
      message: err.message || 'Unknown error',
      code: err.code || 'unknown',
    }))
  }

  const issues = props.validationErrors ? formatIssues(props.validationErrors) : []

  return (
    <div className="space-y-3">
      {/* Main Error Message */}
      <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
        <p className="text-sm text-red-800 dark:text-red-200 font-medium">Error</p>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{props.errorMessage}</p>
      </div>

      {/* Validation Issues */}
      {issues.length > 0 && (
        <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-orange-800 dark:text-orange-200 font-medium hover:underline flex items-center gap-2"
          >
            <span>{showDetails ? '▼' : '▶'}</span>
            {issues.length} Validation {issues.length === 1 ? 'Issue' : 'Issues'}
          </button>

          {showDetails && (
            <ul className="mt-2 space-y-2">
              {issues.map((issue, idx) => (
                <li key={idx} className="text-xs text-orange-700 dark:text-orange-300 ml-4">
                  <div className="font-mono font-medium">
                    {issue.path.length > 0 ? issue.path.join('.') : 'root'}
                  </div>
                  <div className="text-orange-600 dark:text-orange-400">{issue.message}</div>
                  {issue.code && (
                    <div className="text-orange-500 dark:text-orange-500 text-xs">
                      Code: {issue.code}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Recovery Options */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Recovery Options:</p>
        <div className="flex flex-wrap gap-2">
          {props.onRetry && (
            <button
              onClick={props.onRetry}
              disabled={props.isLoading}
              className="px-3 py-1 text-xs border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {props.isLoading ? '⟳ Retrying...' : '↻ Retry Generation'}
            </button>
          )}

          {props.rawResponse && (
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="px-3 py-1 text-xs border border-secondary text-secondary-foreground rounded-md hover:bg-secondary disabled:opacity-50 transition-colors"
            >
              {showRaw ? '▼ Hide Raw Response' : '▶ View Raw Response'}
            </button>
          )}
        </div>
      </div>

      {/* Raw Response */}
      {showRaw && props.rawResponse && (
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-2">Raw Response:</p>
          <pre className="text-xs max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-slate-700 dark:text-slate-300 font-mono">
            {props.rawResponse}
          </pre>
        </div>
      )}

      {/* Help Text */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> If validation fails, try:
          <ul className="ml-4 mt-1 list-disc text-xs space-y-1">
            <li>Retrying the generation (the LLM may generate valid content next time)</li>
            <li>Viewing the raw response to understand what went wrong</li>
            <li>Checking the validation errors above for specific field issues</li>
            <li>Adjusting your custom instructions to be more specific</li>
          </ul>
        </p>
      </div>
    </div>
  )
}
