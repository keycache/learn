/**
 * Quizzes Tab Component
 * Allows user to generate quizzes with customizable question counts
 * Phase 8.5 - Wired to LLMService
 */

import { useState } from 'react'
import { QUIZ_PROMPTS, interpolateQuizPrompt } from '../prompts/quizPrompts'
import { useSelection } from '../hooks/useSelection'
import { useGeneration } from '../hooks/useGeneration'
import { useGenerateQuizMutation } from '../hooks/useGenerateQuizMutation'

export interface QuizFormState {
  topic: string
  lessonId: string
  easyCount: number
  mediumCount: number
  hardCount: number
  customInstructions: string
}

interface QuizzesTabProps {
  selectedTopic?: string
  onGenerate?: (form: QuizFormState) => void
}

export function QuizzesTab(props: QuizzesTabProps) {
  const { selection } = useSelection()
  const { generation } = useGeneration()
  const { generateQuiz } = useGenerateQuizMutation()
  const [lessonId, setLessonId] = useState<string>('')
  const [easyCount, setEasyCount] = useState<number>(30)
  const [mediumCount, setMediumCount] = useState<number>(30)
  const [hardCount, setHardCount] = useState<number>(30)
  const [promptTemplate, setPromptTemplate] = useState<'standard' | 'vocabulary' | 'grammar' | 'comprehension'>('standard')
  const [customInstructions, setCustomInstructions] = useState<string>('')
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(false)

  const mockLessons = [
    { id: 'lesson-001', name: 'French Greetings' },
    { id: 'lesson-002', name: 'Numbers 1-100' },
    { id: 'lesson-003', name: 'Basic Colors' },
  ]

  const promptTemplates = [
    { id: 'standard' as const, label: 'Standard Quiz' },
    { id: 'vocabulary' as const, label: 'Vocabulary-Focused' },
    { id: 'grammar' as const, label: 'Grammar-Focused' },
    { id: 'comprehension' as const, label: 'Comprehension-Focused' },
  ]

  const totalQuestions = easyCount + mediumCount + hardCount

  const isComplete = selection.topic && lessonId && customInstructions.trim()

  const handleGenerate = async () => {
    if (!isComplete) {
      return
    }

    await generateQuiz({
      category: selection.category || 'Language',
      subcategory: selection.subcategory || 'General',
      topic: selection.topic || '',
      lessonTitle: mockLessons.find(l => l.id === lessonId)?.name || 'Untitled Lesson',
      easyCount,
      mediumCount,
      hardCount,
      customInstructions,
      promptTemplate,
    })
  }

  // Get the selected prompt template
  const selectedPrompt = QUIZ_PROMPTS[promptTemplate]

  // Interpolate the prompt with current values
  const interpolatedPrompt = interpolateQuizPrompt(
    selectedPrompt.userPrompt,
    {
      category: selection.category || 'Language',
      subcategory: selection.subcategory || 'General',
      topic: selection.topic || '',
      lessonTitle: mockLessons.find(l => l.id === lessonId)?.name || 'Untitled Lesson',
      easyCount,
      mediumCount,
      hardCount,
      totalCount: totalQuestions,
      customInstructions,
    }
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Generate Quiz</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure quiz parameters and provide custom instructions
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
          value={selection.topic || ''}
          readOnly
          placeholder="Select topic from Selection tab"
          className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground text-sm placeholder-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Automatically populated from Selection tab
        </p>
      </div>

      {/* Lesson Selector */}
      <div className="space-y-2">
        <label htmlFor="lesson" className="text-sm font-medium">
          Select Lesson * (Quiz should correspond to a lesson)
        </label>
        <select
          id="lesson"
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
        >
          <option value="">Choose a lesson...</option>
          {mockLessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          The quiz will test knowledge from the selected lesson
        </p>
      </div>

      {/* Question Counts */}
      <div className="space-y-4">
        <div className="text-sm font-medium">Questions Per Difficulty Level</div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <label htmlFor="easy" className="text-xs font-medium block">
              Easy
            </label>
            <input
              id="easy"
              type="number"
              min="0"
              max="100"
              value={easyCount}
              onChange={(e) => setEasyCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-2 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            />
            <p className="text-xs text-muted-foreground text-center">{Math.round((easyCount / totalQuestions) * 100)}%</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="medium" className="text-xs font-medium block">
              Medium
            </label>
            <input
              id="medium"
              type="number"
              min="0"
              max="100"
              value={mediumCount}
              onChange={(e) => setMediumCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-2 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            />
            <p className="text-xs text-muted-foreground text-center">{Math.round((mediumCount / totalQuestions) * 100)}%</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="hard" className="text-xs font-medium block">
              Hard
            </label>
            <input
              id="hard"
              type="number"
              min="0"
              max="100"
              value={hardCount}
              onChange={(e) => setHardCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-2 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            />
            <p className="text-xs text-muted-foreground text-center">{Math.round((hardCount / totalQuestions) * 100)}%</p>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium">
            Total Questions: <span className="text-primary">{totalQuestions}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Estimated completion time: {Math.ceil(totalQuestions * 1.5)} minutes
          </p>
        </div>
      </div>

      {/* Prompt Template Selector */}
      <div className="space-y-2">
        <label htmlFor="promptTemplate" className="text-sm font-medium">
          Quiz Style
        </label>
        <select
          id="promptTemplate"
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value as 'standard' | 'vocabulary' | 'grammar' | 'comprehension')}
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
          placeholder="Provide specific instructions for quiz generation (e.g., focus on vocabulary, include grammatical forms, etc.)"
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
          {generation.isLoading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>

      {!isComplete && !generation.isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Fill in all required fields to generate
        </p>
      )}

      {/* Generation Error */}
      {generation.error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-100 font-medium">Error</p>
          <p className="text-sm text-red-700 dark:text-red-200 mt-1">{generation.error}</p>
          {generation.validationErrors.length > 0 && (
            <ul className="text-xs text-red-600 dark:text-red-300 mt-2 list-disc list-inside">
              {generation.validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Generation Success */}
      {generation.result && 'questions' in generation.result && (
        <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md">
          <p className="text-sm text-green-800 dark:text-green-100 font-medium">✓ Quiz Generated Successfully</p>
          <div className="text-sm text-green-700 dark:text-green-200 mt-2">
            <p><strong>Total Questions:</strong> {generation.result.questions.length}</p>
            <p><strong>Quiz Version:</strong> {generation.result.quiz_version}</p>
            {generation.result.questions && (
              <p><strong>Topics Covered:</strong> {Array.from(new Set(generation.result.questions.map(q => q.type))).join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>What happens next:</strong> After you click Generate, the LLM will create a quiz
          following the template shown above. You'll see a preview and have the option to save or retry.
        </p>
      </div>
    </div>
  )
}
