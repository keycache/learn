/**
 * Selection Tab Component
 * Allows user to select category, subcategory, topic, and generation type
 * Phase 8.2
 */

import { useState } from 'react'

export interface SelectionFormState {
  category: string
  subcategory: string
  topic: string
  type: 'lesson' | 'quiz' | ''
}

interface SelectionTabProps {
  onSelectionChange?: (selection: SelectionFormState) => void
}

export function SelectionTab(props: SelectionTabProps) {
  const [category, setCategory] = useState<string>('')
  const [subcategory, setSubcategory] = useState<string>('')
  const [topic, setTopic] = useState<string>('')
  const [type, setType] = useState<'lesson' | 'quiz' | ''>('')

  // TODO: Phase 8.3 - Load from actual file system via API
  const mockCategories = ['Spoken Languages', 'Grammar', 'Vocabulary', 'Pronunciation']
  const mockSubcategories = category ? ['French', 'Spanish', 'German', 'Italian'] : []
  const mockTopics = subcategory ? ['Numbers', 'Colors', 'Greetings', 'Food', 'Animals'] : []

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setSubcategory('')
    setTopic('')
    setType('')
  }

  const handleSubcategoryChange = (value: string) => {
    setSubcategory(value)
    setTopic('')
    setType('')
  }

  const handleTopicChange = (value: string) => {
    setTopic(value)
    setType('')
  }

  const handleTypeChange = (value: 'lesson' | 'quiz') => {
    setType(value)
    if (props.onSelectionChange) {
      props.onSelectionChange({ category, subcategory, topic, type: value })
    }
  }

  const isComplete = category && subcategory && topic && type

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Content</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a category, subcategory, and topic, then select whether to generate a lesson or quiz
        </p>
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          Category *
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
        >
          <option value="">Select a category...</option>
          {mockCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {!category && <p className="text-xs text-muted-foreground">Required</p>}
      </div>

      {/* Subcategory Selector */}
      <div className="space-y-2">
        <label htmlFor="subcategory" className="text-sm font-medium">
          Subcategory * {!category && <span className="text-xs text-muted-foreground">(select category first)</span>}
        </label>
        <select
          id="subcategory"
          value={subcategory}
          onChange={(e) => handleSubcategoryChange(e.target.value)}
          disabled={!category}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select a subcategory...</option>
          {mockSubcategories.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
        {!subcategory && category && <p className="text-xs text-muted-foreground">Required</p>}
      </div>

      {/* Topic Selector */}
      <div className="space-y-2">
        <label htmlFor="topic" className="text-sm font-medium">
          Topic * {!subcategory && <span className="text-xs text-muted-foreground">(select subcategory first)</span>}
        </label>
        <select
          id="topic"
          value={topic}
          onChange={(e) => handleTopicChange(e.target.value)}
          disabled={!subcategory}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select a topic...</option>
          {mockTopics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {!topic && subcategory && <p className="text-xs text-muted-foreground">Required</p>}
      </div>

      {/* Type Selector */}
      {topic && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Generation Type *</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-accent transition-colors">
              <input
                type="radio"
                name="type"
                value="lesson"
                checked={type === 'lesson'}
                onChange={(e) => handleTypeChange(e.target.value as 'lesson')}
                className="cursor-pointer"
              />
              <div>
                <div className="font-medium">Lesson</div>
                <div className="text-xs text-muted-foreground">Generate a comprehensive lesson with sections and key takeaways</div>
              </div>
            </label>

            <label className="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-accent transition-colors">
              <input
                type="radio"
                name="type"
                value="quiz"
                checked={type === 'quiz'}
                onChange={(e) => handleTypeChange(e.target.value as 'quiz')}
                className="cursor-pointer"
              />
              <div>
                <div className="font-medium">Quiz</div>
                <div className="text-xs text-muted-foreground">Generate a quiz with customizable question counts</div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="p-4 bg-accent rounded-md">
        <div className="text-sm font-medium mb-2">Progress</div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>{category ? '✓' : '○'} Category selected</div>
          <div>{subcategory ? '✓' : '○'} Subcategory selected</div>
          <div>{topic ? '✓' : '○'} Topic selected</div>
          <div>{type ? '✓' : '○'} Type selected</div>
        </div>
      </div>

      {isComplete && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md flex items-center gap-2">
          <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
          <span className="text-sm text-green-800 dark:text-green-200">
            Selection complete! Proceed to the {type === 'lesson' ? 'Lessons' : 'Quizzes'} tab.
          </span>
        </div>
      )}
    </div>
  )
}
