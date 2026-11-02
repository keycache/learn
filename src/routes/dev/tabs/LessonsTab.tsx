/**
 * Lessons Tab Component
 * Allows user to generate lessons with customizable parameters
 * Phase 8.2
 */

import { useState } from 'react'
import { LESSON_PROMPTS, interpolateLessonPrompt } from '../prompts/lessonPrompts'

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
  const [topic, setTopic] = useState<string>(props.selectedTopic || '')
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

  const handleGenerate = () => {
    if (!topic.trim() || !customInstructions.trim()) {
      return
    }

    if (props.onGenerate) {
      props.onGenerate({
        topic,
        ageGroup,
        customInstructions,
      })
    }
  }

  const isComplete = topic && ageGroup && customInstructions.trim()

  // Get the selected prompt template
  const selectedPrompt = LESSON_PROMPTS[promptTemplate]
  
  // Interpolate the prompt with current values
  const interpolatedPrompt = interpolateLessonPrompt(
    selectedPrompt.userPrompt,
    {
      category: 'Spanish', // TODO: Phase 8.3 - Get from context
      subcategory: 'Beginner', // TODO: Phase 8.3 - Get from context
      topic,
      ageGroup,
      difficulty: 'beginner', // TODO: Phase 8.3 - Get from context
      customInstructions,
    }
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Generate Lesson</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure lesson parameters and provide custom instructions
        </p>
      </div>

      {/* Topic Display */}
      <div className="space-y-2">
        <label htmlFor="topic" className="text-sm font-medium">
          Topic
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter or select topic from Selection tab"
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm placeholder-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Typically populated from Selection tab
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
          <div className="mt-3 p-4 bg-muted rounded-md border border-border">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold mb-1">System Prompt:</h4>
                <pre className="text-xs whitespace-pre-wrap break-words text-muted-foreground font-mono bg-background p-2 rounded border border-border">
                  {selectedPrompt.systemPrompt.substring(0, 500)}...
                </pre>
              </div>
              <div>
                <h4 className="text-xs font-semibold mb-1">Interpolated User Prompt:</h4>
                <pre className="text-xs whitespace-pre-wrap break-words text-muted-foreground font-mono bg-background p-2 rounded border border-border">
                  {interpolatedPrompt}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleGenerate}
          disabled={!isComplete}
          style={{
            backgroundColor: 'hsl(238 92% 66%)',
            color: 'hsl(0 0% 100%)',
          }}
          className="px-6 py-2 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Generate Lesson
        </button>
      </div>

      {!isComplete && (
        <p className="text-xs text-muted-foreground text-center">
          Fill in all required fields to generate
        </p>
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
