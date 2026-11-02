/**
 * Quizzes Tab Component
 * Allows user to generate quizzes with customizable question counts
 * Phase 8.2
 */

import { useState } from 'react'
import { QUIZ_PROMPTS, interpolateQuizPrompt } from '../prompts/quizPrompts'

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
  const [topic, setTopic] = useState<string>(props.selectedTopic || '')
  const [lessonId, setLessonId] = useState<string>('')
  const [easyCount, setEasyCount] = useState<number>(30)
  const [mediumCount, setMediumCount] = useState<number>(30)
  const [hardCount, setHardCount] = useState<number>(30)
  const [promptTemplate, setPromptTemplate] = useState<'standard' | 'vocabulary' | 'grammar' | 'comprehension'>('standard')
  const [customInstructions, setCustomInstructions] = useState<string>('')
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(false)

  // TODO: Phase 8.3 - Load actual lessons from file system
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

  const handleGenerate = () => {
    if (!topic.trim() || !lessonId || !customInstructions.trim()) {
      return
    }

    if (props.onGenerate) {
      props.onGenerate({
        topic,
        lessonId,
        easyCount,
        mediumCount,
        hardCount,
        customInstructions,
      })
    }
  }

  const isComplete = topic && lessonId && customInstructions.trim()

  // Get the selected prompt template
  const selectedPrompt = QUIZ_PROMPTS[promptTemplate]
  
  // Interpolate the prompt with current values
  const interpolatedPrompt = interpolateQuizPrompt(
    selectedPrompt.userPrompt,
    {
      category: 'Spanish', // TODO: Phase 8.3 - Get from context
      subcategory: 'Beginner', // TODO: Phase 8.3 - Get from context
      topic,
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
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter or select topic from Selection tab"
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm placeholder-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Typically populated from Selection tab
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
          Generate Quiz
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
          <strong>What happens next:</strong> After you click Generate, the LLM will create a quiz 
          following the template shown above. You'll see a preview and have the option to save or retry.
        </p>
      </div>
    </div>
  )
}
