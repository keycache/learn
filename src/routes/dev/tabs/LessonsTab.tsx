/**
 * Lessons Tab Component
 * Allows user to generate lessons with customizable parameters
 * Phase 8.6 - Enhanced with validation error display and recovery
 */

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LESSON_PROMPTS, interpolateLessonPrompt } from '../prompts/lessonPrompts'
import { useSelection } from '../hooks/useSelection'
import { useGeneration } from '../hooks/useGeneration'
import { useGenerateLessonMutation } from '../hooks/useGenerateLessonMutation'
import { ValidationErrorDisplay } from '../components/ValidationErrorDisplay'
import { LessonValidator } from '@/services/validators'

export interface LessonFormState {
  topic: string
  ageGroup: string
  customInstructions: string
}

interface LessonsTabProps {
  selectedTopic?: string
  onGenerate?: (form: LessonFormState) => void
}

export function LessonsTab(props: LessonsTabProps) {
  const { selection } = useSelection()
  const { generation } = useGeneration()
  const { generateLesson } = useGenerateLessonMutation()
  const [ageGroup, setAgeGroup] = useState<string>('9-12 years')
  const [promptTemplate, setPromptTemplate] = useState<'standard' | 'conversation' | 'grammar'>('standard')
  const [customInstructions, setCustomInstructions] = useState<string>('')
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(false)

  const ageGroups = ['5-8 years', '9-12 years', '13-18 years', '18+ years']
  const promptTemplates = [
    { id: 'standard' as const, label: 'Standard Lesson' },
    { id: 'conversation' as const, label: 'Conversation-Focused' },
    { id: 'grammar' as const, label: 'Grammar-Focused' },
  ]

  const isComplete = selection.topic && ageGroup && customInstructions.trim()

  const handleGenerate = async () => {
    if (!isComplete) {
      return
    }

    await generateLesson({
      category: selection.category || 'Language',
      subcategory: selection.subcategory || 'General',
      topic: selection.topic || '',
      ageGroup,
      difficulty: 'beginner',
      customInstructions,
      promptTemplate,
    })
  }

  // Get the selected prompt template
  const selectedPrompt = LESSON_PROMPTS[promptTemplate]

  // Interpolate the prompt with current values
  const interpolatedPrompt = interpolateLessonPrompt(
    selectedPrompt.userPrompt,
    {
      category: selection.category || 'Language',
      subcategory: selection.subcategory || 'General',
      topic: selection.topic || '',
      ageGroup,
      difficulty: 'beginner',
      customInstructions,
    }
  )

  return (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">Generate Lesson</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure lesson parameters and provide custom instructions
        </p>
      {/* <div>
      </div> */}

      {/* Topic Display */}
      <div className="space-y-2">
        <label htmlFor="topic" className="text-sm font-medium">
          Topic
        </label>
        <input
          id="topic"
          type="text"
          value={selection.topic || ''}
          readOnly
          placeholder="Select topic from Selection tab"
          className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground text-sm placeholder-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Automatically populated from Selection tab
        </p>
      </div>

      {/* Age Group Selector */}
      <div className="space-y-2">
        <label htmlFor="ageGroup" className="text-sm font-medium">
          Target Age Group *
        </label>
        <select
          id="ageGroup"
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
        >
          {ageGroups.map((ag) => (
            <option key={ag} value={ag}>{ag}</option>
          ))}
        </select>
      </div>

      {/* Prompt Template Selector */}
      <div className="space-y-2">
        <label htmlFor="promptTemplate" className="text-sm font-medium">
          Lesson Style
        </label>
        <select
          id="promptTemplate"
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value as 'standard' | 'conversation' | 'grammar')}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
        >
          {promptTemplates.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {selectedPrompt.description}
        </p>
      </div>

      {/* Custom Instructions */}
      <div className="space-y-2">
        <label htmlFor="instructions" className="text-sm font-medium">
          Custom Instructions * (Required)
        </label>
        <textarea
          id="instructions"
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="Provide specific instructions for lesson generation (e.g., focus areas, teaching style, activities to include)"
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm placeholder-muted-foreground resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {customInstructions.length} characters
        </p>
      </div>

      {/* Prompt Preview Toggle */}
      <div>
        <button
          onClick={() => setShowPromptPreview(!showPromptPreview)}
          className="text-sm text-primary hover:underline font-medium"
        >
          {showPromptPreview ? '▼' : '▶'} View Prompt Template
        </button>

        {showPromptPreview && (
          <div>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold mb-1">System Prompt:</h4>
                <div className="max-h-64 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap break-words text-muted-foreground font-mono bg-background p-2 rounded border border-border">
                    {selectedPrompt.systemPrompt}
                  </pre>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold mb-1">Interpolated User Prompt:</h4>
                <div className="max-h-64 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap break-words text-muted-foreground font-mono bg-background p-2 rounded border border-border">
                    {interpolatedPrompt}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleGenerate}
          disabled={!isComplete || generation.isLoading}
          style={{
            backgroundColor: 'hsl(238 92% 66%)',
            color: 'hsl(0 0% 100%)',
          }}
          className="px-6 py-2 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {generation.isLoading ? 'Generating...' : 'Generate Lesson'}
        </button>
      </div>

      {!isComplete && !generation.isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Fill in all required fields to generate
        </p>
      )}

      {/* Generation Error - Enhanced Display */}
      {generation.error && (
        <ValidationErrorDisplay
          errorMessage={generation.error}
          validationErrors={generation.validationErrors}
          rawResponse={generation.rawResponse}
          onRetry={handleGenerate}
          isLoading={generation.isLoading}
        />
      )}

      {/* Generation Success */}
      {generation.result && 'content' in generation.result && (
        <div className="space-y-3">
          <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-100 font-medium">✓ Lesson Generated Successfully</p>
            <div className="text-sm text-green-700 dark:text-green-200 mt-2">
              <p><strong>Title:</strong> {(generation.result as any).title}</p>
              <p><strong>Duration:</strong> {(generation.result as any).duration}</p>
              <p><strong>Difficulty:</strong> {(generation.result as any).difficulty}</p>
              
              {/* Business Rule Validation */}
              {(() => {
                const validationErrors = LessonValidator.validate(generation.result as any)
                if (validationErrors.length > 0) {
                  return (
                    <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
                      <p className="text-xs font-medium text-green-700 dark:text-green-200">Validation Warnings:</p>
                      <ul className="text-xs mt-1 space-y-1 text-green-600 dark:text-green-300">
                        {validationErrors.map((err, idx) => (
                          <li key={idx}>• {err.message}</li>
                        ))}
                      </ul>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          </div>

          {/* Full Lesson Content Display */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Lesson Content</h3>
            <div className="max-h-96 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: (props) => <h1 className="text-xl font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100" {...props} />,
                    h2: (props) => <h2 className="text-lg font-bold mt-3 mb-2 text-slate-800 dark:text-slate-200" {...props} />,
                    h3: (props) => <h3 className="text-base font-semibold mt-2 mb-1 text-slate-800 dark:text-slate-200" {...props} />,
                    p: (props) => <p className="text-sm text-slate-700 dark:text-slate-300 mb-2" {...props} />,
                    ul: (props) => <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 mb-2 space-y-1" {...props} />,
                    ol: (props) => <ol className="list-decimal list-inside text-sm text-slate-700 dark:text-slate-300 mb-2 space-y-1" {...props} />,
                    li: (props) => <li className="text-sm text-slate-700 dark:text-slate-300" {...props} />,
                    table: (props) => <table className="w-full border-collapse border border-slate-300 dark:border-slate-600 text-xs mb-2" {...props} />,
                    thead: (props) => <thead className="bg-slate-100 dark:bg-slate-800" {...props} />,
                    tbody: (props) => <tbody {...props} />,
                    tr: (props) => <tr className="border-b border-slate-300 dark:border-slate-600" {...props} />,
                    th: (props) => <th className="border border-slate-300 dark:border-slate-600 px-2 py-1 bg-slate-200 dark:bg-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-left" {...props} />,
                    td: (props) => <td className="border border-slate-300 dark:border-slate-600 px-2 py-1 text-slate-700 dark:text-slate-300" {...props} />,
                    strong: (props) => <strong className="font-bold text-slate-900 dark:text-slate-100" {...props} />,
                    em: (props) => <em className="italic text-slate-700 dark:text-slate-300" {...props} />,
                    code: (props) => <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs font-mono text-slate-900 dark:text-slate-100" {...props} />,
                    blockquote: (props) => <blockquote className="border-l-4 border-slate-400 dark:border-slate-600 pl-3 italic text-slate-600 dark:text-slate-400 my-2" {...props} />,
                  }}
                >
                  {(generation.result as any).content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>What happens next:</strong> After you click Generate, the LLM will create a lesson
          following the template shown above. You'll see a preview and have the option to save or retry.
        </p>
      </div>
    </div>
  )
}

