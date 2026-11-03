/**
 * Selection Tab Component
 * Allows user to select category, subcategory, topic, and generation type
 * Phase 8.3 - Integrated with Context
 * Phase 8.10 - Updated to use real file system and CreatableSelect
 */

import { useEffect } from 'react'
import { useSelection } from '../hooks/useSelection'
import { useFileSystem } from '../hooks/useFileSystem'
import { CreatableSelect } from '../components/CreatableSelect'

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
  const { selection, setCategory, setSubcategory, setTopic, setType } = useSelection()
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
    clearError: clearFsError,
  } = useFileSystem()

  // Initialize categories on mount
  useEffect(() => {
    queryCategories()
  }, [])

  // Load subcategories when category changes
  useEffect(() => {
    if (selection.category) {
      querySubcategories(selection.category)
      setSubcategory(null)
      setTopic(null)
    }
  }, [selection.category])

  // Load topics when subcategory changes
  useEffect(() => {
    if (selection.category && selection.subcategory) {
      queryTopics(selection.category, selection.subcategory)
      setTopic(null)
    }
  }, [selection.category, selection.subcategory])

  const handleCategoryChange = (value: string) => {
    setCategory(value || null)
  }

  const handleSubcategoryChange = (value: string) => {
    setSubcategory(value || null)
  }

  const handleTopicChange = (value: string) => {
    setTopic(value || null)
  }

  const handleTypeChange = (value: 'lesson' | 'quiz' | '') => {
    setType(value || null)
    if (props.onSelectionChange && value) {
      props.onSelectionChange({ 
        category: selection.category || '', 
        subcategory: selection.subcategory || '', 
        topic: selection.topic || '', 
        type: value as 'lesson' | 'quiz' 
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Content</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a category, subcategory, and topic, then select whether to generate a lesson or quiz
        </p>
      </div>

      {/* File System Error Display */}
      {fsError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-900">File System Error</p>
              <p className="text-sm text-red-700">{fsError}</p>
            </div>
            <button
              onClick={clearFsError}
              className="text-red-700 hover:text-red-900 font-medium text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Category Selector */}
      <CreatableSelect
        options={categories}
        value={selection.category || ''}
        onChange={(value) => {
          handleCategoryChange(value)
          setSubcategory(null)
          setTopic(null)
        }}
        onCreateNew={createCategory}
        placeholder="Select or type to create category..."
        label="Category"
        required
        disabled={fsLoading}
        loading={fsLoading}
        error={fsError && !selection.category ? fsError : null}
      />

      {/* Subcategory Selector */}
      <CreatableSelect
        options={subcategories}
        value={selection.subcategory || ''}
        onChange={(value) => {
          handleSubcategoryChange(value)
          setTopic(null)
        }}
        onCreateNew={(subName) => 
          selection.category ? createSubcategory(selection.category, subName) : Promise.resolve(false)
        }
        placeholder="Select or type to create subcategory..."
        label="Subcategory"
        required
        disabled={!selection.category || fsLoading}
        loading={fsLoading}
      />

      {/* Topic Selector */}
      <CreatableSelect
        options={topics}
        value={selection.topic || ''}
        onChange={handleTopicChange}
        onCreateNew={(topicName) =>
          selection.category && selection.subcategory
            ? createTopic(selection.category, selection.subcategory, topicName)
            : Promise.resolve(false)
        }
        placeholder="Select or type to create topic..."
        label="Topic"
        required
        disabled={!selection.category || !selection.subcategory || fsLoading}
        loading={fsLoading}
      />

      {/* Type Selector */}
      {selection.topic && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Generation Type *</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-accent transition-colors">
              <input
                type="radio"
                name="type"
                value="lesson"
                checked={selection.type === 'lesson'}
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
                checked={selection.type === 'quiz'}
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
          <div>{selection.category ? '✓' : '○'} Category selected</div>
          <div>{selection.subcategory ? '✓' : '○'} Subcategory selected</div>
          <div>{selection.topic ? '✓' : '○'} Topic selected</div>
          <div>{selection.type ? '✓' : '○'} Type selected</div>
        </div>
      </div>

      {selection.category && selection.subcategory && selection.topic && selection.type && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md flex items-center gap-2">
          <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
          <span className="text-sm text-green-800 dark:text-green-200">
            Selection complete! Proceed to the {selection.type === 'lesson' ? 'Lessons' : 'Quizzes'} tab.
          </span>
        </div>
      )}
    </div>
  )
}
