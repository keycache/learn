/**
 * Quizzes Tab Component
 * Allows user to generate quizzes with customizable parameters
 * Phase 8.9 - Enhanced with file system cascade dropdowns and save functionality
 * Phase 8.10 - Enhanced with creatable category/subcategory/topic dropdowns
 * Phase 8.11 - Enhanced with multi-select lesson picker and dynamic prompt generation
 */

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { QUIZ_PROMPTS, interpolateQuizPrompt } from '../prompts/quizPrompts'
import { useSelection } from '../hooks/useSelection'
import { useGeneration } from '../hooks/useGeneration'
import { useGenerateQuizMutation } from '../hooks/useGenerateQuizMutation'
import { useFileSystem } from '../hooks/useFileSystem'
import { useLessonDiscovery } from '../hooks/useLessonDiscovery'
import { ValidationErrorDisplay } from '../components/ValidationErrorDisplay'
import { CreatableSelect } from '../components/CreatableSelect'
import { LessonMultiSelect } from '../components/LessonMultiSelect'
import { QuizValidator } from '@/services/validators'
import type { QuizFileData } from '@/services/fileOperations.types'

export interface QuizFormState {
  category: string
  subcategory: string
  topic: string
  selectedLessons: string[]
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
  const {
    categories,
    subcategories,
    topics,
    loading: fsLoading,
    error: fsError,
    queryCategories,
    querySubcategories,
    queryTopics,
    createCategory,
    createSubcategory,
    createTopic,
    saveQuizFile,
    clearError: clearFsError,
  } = useFileSystem()

  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
    discoverTopicLessons,
    getSelectedLessonContents,
    clearLessons,
  } = useLessonDiscovery()

  const [category, setCategory] = useState<string>('')
  const [subcategory, setSubcategory] = useState<string>('')
  const [topic, setTopic] = useState<string>('')
  const [selectedLessons, setSelectedLessons] = useState<string[]>([])
  const [lessonTitle, setLessonTitle] = useState<string>('')
  const [lessonVersion, setLessonVersion] = useState<string>('1.0')
  const [easyCount, setEasyCount] = useState<number>(30)
  const [mediumCount, setMediumCount] = useState<number>(30)
  const [hardCount, setHardCount] = useState<number>(30)
  const [promptTemplate, setPromptTemplate] = useState<'standard' | 'vocabulary' | 'grammar' | 'comprehension'>('standard')
  const [customInstructions, setCustomInstructions] = useState<string>('')
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lessonContentsLoading, setLessonContentsLoading] = useState(false)
  const [previewLessonContent, setPreviewLessonContent] = useState<string>('')

  const promptTemplates = [
    { id: 'standard' as const, label: 'Standard Quiz' },
    { id: 'vocabulary' as const, label: 'Vocabulary-Focused' },
    { id: 'grammar' as const, label: 'Grammar-Focused' },
    { id: 'comprehension' as const, label: 'Comprehension-Focused' },
  ]

  // Initialize categories on mount
  useEffect(() => {
    queryCategories()
  }, [])

  // Load subcategories when category changes
  useEffect(() => {
    if (category) {
      querySubcategories(category)
      setSubcategory('')
      setTopic('')
    }
  }, [category])

  // Load topics when subcategory changes
  useEffect(() => {
    if (category && subcategory) {
      queryTopics(category, subcategory)
      setTopic('')
      setSelectedLessons([])
      clearLessons()
    }
  }, [category, subcategory])

  // Discover lessons when topic changes
  useEffect(() => {
    if (category && subcategory && topic) {
      discoverTopicLessons(category, subcategory, topic)
      setSelectedLessons([])
    }
  }, [topic, category, subcategory])

  // Load lesson content when preview is opened or lessons are selected
  useEffect(() => {
    const loadPreviewContent = async () => {
      if (showPromptPreview && selectedLessons.length > 0 && category && subcategory && topic) {
        try {
          setLessonContentsLoading(true)
          const content = await getSelectedLessonContents(category, subcategory, topic, selectedLessons)
          setPreviewLessonContent(content)
        } catch (err) {
          setPreviewLessonContent('Error loading lesson content: ' + (err instanceof Error ? err.message : String(err)))
        } finally {
          setLessonContentsLoading(false)
        }
      } else if (!showPromptPreview) {
        setPreviewLessonContent('')
      }
    }

    loadPreviewContent()
  }, [showPromptPreview, selectedLessons, category, subcategory, topic, getSelectedLessonContents])

  const isComplete = category && subcategory && topic && selectedLessons.length > 0 && easyCount > 0 && mediumCount > 0 && hardCount > 0 && customInstructions.trim()

  const handleGenerateWithLessonContent = async () => {
    if (!isComplete) {
      return
    }

    setLessonContentsLoading(true)
    try {
      // Get the full content of selected lessons
      const lessonContents = await getSelectedLessonContents(category, subcategory, topic, selectedLessons)

      // Build augmented custom instructions with lesson content
      const augmentedInstructions = `## Selected Lesson Content:\n\n${lessonContents}\n\n## Custom Instructions:\n\n${customInstructions}`

      await generateQuiz({
        category,
        subcategory,
        topic,
        lessonTitle: selectedLessons.join(', '),
        easyCount,
        mediumCount,
        hardCount,
        customInstructions: augmentedInstructions,
        promptTemplate,
      })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to load lesson contents')
    } finally {
      setLessonContentsLoading(false)
    }
  }

  const handleSaveQuiz = async () => {
    if (!generation.result || !('questions' in generation.result)) {
      setSaveError('No quiz generated yet')
      return
    }

    if (!category || !subcategory || !topic) {
      setSaveError('Please select category, subcategory, and topic')
      return
    }

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const quizData: QuizFileData = {
        title: (generation.result as any).title,
        summary: (generation.result as any).summary,
        difficulty: (generation.result as any).difficulty,
        questions: (generation.result as any).questions,
        metadata: {
          createdAt: new Date().toISOString(),
          lessonVersion,
          category,
          subcategory,
          topic,
        },
      }

      const result = await saveQuizFile(category, subcategory, topic, quizData)

      if (result.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setSaveError(result.error || 'Failed to save quiz')
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save quiz')
    } finally {
      setSaving(false)
    }
  }

  // Get the selected prompt template
  const selectedPrompt = QUIZ_PROMPTS[promptTemplate]

  // Interpolate the prompt with current values (without lesson content - used when not previewing)
  const interpolatedPrompt = interpolateQuizPrompt(
    selectedPrompt.userPrompt,
    {
      category: category || 'Language',
      subcategory: subcategory || 'General',
      topic: topic || '',
      lessonTitle: selectedLessons.join(', ') || 'Selected lessons',
      easyCount,
      mediumCount,
      hardCount,
      totalCount: easyCount + mediumCount + hardCount,
      customInstructions,
    }
  )

  // Interpolate the prompt WITH lesson content for preview
  const augmentedCustomInstructions = previewLessonContent
    ? `## Selected Lesson Content:\n\n${previewLessonContent}\n\n## Custom Instructions:\n\n${customInstructions}`
    : customInstructions

  const interpolatedPromptWithContent = interpolateQuizPrompt(
    selectedPrompt.userPrompt,
    {
      category: category || 'Language',
      subcategory: subcategory || 'General',
      topic: topic || '',
      lessonTitle: selectedLessons.join(', ') || 'Selected lessons',
      easyCount,
      mediumCount,
      hardCount,
      totalCount: easyCount + mediumCount + hardCount,
      customInstructions: augmentedCustomInstructions,
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

      {/* File System Dropdowns */}
      {fsError && (
        <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-100">
            <strong>Error:</strong> {fsError}
          </p>
          <button
            onClick={clearFsError}
            className="mt-2 text-xs text-red-700 dark:text-red-200 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Category & Subcategory Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category Dropdown */}
        <CreatableSelect
          options={categories}
          value={category}
          onChange={(value) => {
            setCategory(value)
            setSubcategory('')
            setTopic('')
          }}
          onCreateNew={createCategory}
          placeholder="Select or type to create category..."
          label="Category"
          required
          disabled={fsLoading}
          loading={fsLoading}
          error={fsError && category === '' ? fsError : null}
        />

        {/* Subcategory Dropdown */}
        <CreatableSelect
          options={subcategories}
          value={subcategory}
          onChange={(value) => {
            setSubcategory(value)
            setTopic('')
          }}
          onCreateNew={(subName) => (category ? createSubcategory(category, subName) : Promise.resolve(false))}
          placeholder="Select or type to create subcategory..."
          label="Subcategory"
          required
          disabled={!category || fsLoading}
          loading={fsLoading}
        />
      </div>

      {/* Topic & Lessons Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Topic Dropdown */}
        <CreatableSelect
          options={topics}
          value={topic}
          onChange={setTopic}
          onCreateNew={(topicName) =>
            category && subcategory ? createTopic(category, subcategory, topicName) : Promise.resolve(false)
          }
          placeholder="Select or type to create topic..."
          label="Topic"
          required
          disabled={!category || !subcategory || fsLoading}
          loading={fsLoading}
        />

        {/* Multi-Select Lessons */}
        <LessonMultiSelect
          options={lessons}
          selectedIds={selectedLessons}
          onChange={setSelectedLessons}
          placeholder="Select lessons to include in the quiz..."
          label="Lessons *"
          required
          disabled={!category || !subcategory || !topic || lessonsLoading || fsLoading}
          loading={lessonsLoading}
          error={lessonsError ? lessonsError.message : null}
        />
      </div>

      {/* Question Counts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="easyCount" className="text-sm font-medium">
            Easy Questions *
          </label>
          <input
            id="easyCount"
            type="number"
            min="0"
            max="100"
            value={easyCount}
            onChange={(e) => setEasyCount(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          />
          <p className="text-xs text-muted-foreground">0-100</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="mediumCount" className="text-sm font-medium">
            Medium Questions *
          </label>
          <input
            id="mediumCount"
            type="number"
            min="0"
            max="100"
            value={mediumCount}
            onChange={(e) => setMediumCount(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          />
          <p className="text-xs text-muted-foreground">0-100</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="hardCount" className="text-sm font-medium">
            Hard Questions *
          </label>
          <input
            id="hardCount"
            type="number"
            min="0"
            max="100"
            value={hardCount}
            onChange={(e) => setHardCount(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          />
          <p className="text-xs text-muted-foreground">0-100</p>
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
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
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
          placeholder="Provide specific instructions for quiz generation (e.g., question format, difficulty distribution, time limits)"
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm placeholder-muted-foreground resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {customInstructions.length} characters
        </p>
      </div>

      {/* Quiz Configuration Summary */}
      {selectedLessons.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md space-y-2">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Quiz Configuration</h4>
          <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <p><strong>Selected Lessons:</strong> {selectedLessons.join(', ')}</p>
            <p><strong>Question Distribution:</strong> {easyCount} Easy + {mediumCount} Medium + {hardCount} Hard = {easyCount + mediumCount + hardCount} Total</p>
            <p><strong>Lesson Content:</strong> Automatically included in the generation prompt</p>
          </div>
        </div>
      )}

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
                <br />
                <h4 className="text-xs font-semibold mb-1">System Prompt:</h4>
                <div className="max-h-64 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap break-words text-muted-foreground font-mono bg-background p-2 rounded border border-border">
                    {selectedPrompt.systemPrompt}
                  </pre>
                </div>
              </div>
              <div>
                <br />
                <h4 className="text-xs font-semibold mb-1">Interpolated User Prompt (with lesson content and custom instructions):</h4>
                <div className="max-h-64 overflow-y-auto">
                  {lessonContentsLoading && (
                    <div className="text-xs text-muted-foreground p-2">
                      Loading lesson content...
                    </div>
                  )}
                  <pre className="text-xs whitespace-pre-wrap break-words text-muted-foreground font-mono bg-background p-2 rounded border border-border">
                    {lessonContentsLoading ? 'Loading...' : interpolatedPromptWithContent}
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
          onClick={handleGenerateWithLessonContent}
          disabled={!isComplete || generation.isLoading || lessonContentsLoading}
          style={{
            backgroundColor: 'hsl(238 92% 66%)',
            color: 'hsl(0 0% 100%)',
          }}
          className="px-6 py-2 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {generation.isLoading || lessonContentsLoading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>

      {!isComplete && !generation.isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Fill in all required fields to generate
        </p>
      )}

      {/* Generation Error */}
      {(generation.error || saveError) && (
        <ValidationErrorDisplay
          errorMessage={generation.error || saveError || ''}
          validationErrors={generation.validationErrors}
          rawResponse={generation.rawResponse}
          onRetry={handleGenerateWithLessonContent}
          isLoading={generation.isLoading}
        />
      )}

      {/* Generation Success */}
      {generation.result && 'questions' in generation.result && (
        <div className="space-y-3">
          <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-100 font-medium">✓ Quiz Generated Successfully</p>
            <div className="text-sm text-green-700 dark:text-green-200 mt-2">
              <p>
                <strong>Title:</strong> {(generation.result as any).title}
              </p>
              <p>
                <strong>Questions:</strong> {(generation.result as any).questions.length}
              </p>
              <p>
                <strong>Difficulty:</strong> {(generation.result as any).difficulty}
              </p>

              {/* Business Rule Validation */}
              {(() => {
                const validationErrors = QuizValidator.validate(generation.result as any)
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

            {/* Save Status */}
            {saveSuccess && (
              <div className="mt-3 p-2 bg-green-200 dark:bg-green-800 rounded text-sm text-green-800 dark:text-green-100">
                ✓ Quiz saved successfully!
              </div>
            )}

            {saveError && (
              <div className="mt-3 p-2 bg-red-200 dark:bg-red-800 rounded text-sm text-red-800 dark:text-red-100">
                Error: {saveError}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveQuiz}
              disabled={saving || !category || !subcategory || !topic}
              style={{
                backgroundColor: saving ? 'hsl(0 0% 60%)' : 'hsl(142 71% 45%)',
                color: 'hsl(0 0% 100%)',
              }}
              className="mt-3 px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : '💾 Save Quiz to File System'}
            </button>
          </div>

          {/* Quiz Content Display */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Quiz Questions</h3>
            <div className="max-h-96 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                {(generation.result as any).questions.map((question: any, idx: number) => (
                  <div key={idx} className="pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Q{idx + 1}: {question.question}
                    </div>
                    {question.options && (
                      <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 ml-4">
                        {question.options.map((option: string, optIdx: number) => (
                          <li key={optIdx}>
                            {String.fromCharCode(65 + optIdx)}) {option}
                          </li>
                        ))}
                      </ul>
                    )}
                    {question.correctAnswer && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        <strong>Answer:</strong> {question.correctAnswer}
                      </p>
                    )}
                    {question.explanation && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>What happens next:</strong> After you click Generate, the LLM will create a quiz. You'll see a preview and can save it to the file system.
        </p>
      </div>
    </div>
  )
}
