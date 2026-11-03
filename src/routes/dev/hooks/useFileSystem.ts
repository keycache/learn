import { useState, useCallback } from 'react'
import { FileOperations } from '@/services/fileOperations'
import type { FileSystemQuery, LessonFileData, QuizFileData, OperationResult } from '@/services/fileOperations.types'

interface UseFileSystemState {
  categories: string[]
  subcategories: string[]
  topics: string[]
  loading: boolean
  error: string | null
}

/**
 * Hook for file system operations
 * Provides methods to query file system and save lesson/quiz files
 */
export const useFileSystem = () => {
  const [state, setState] = useState<UseFileSystemState>({
    categories: [],
    subcategories: [],
    topics: [],
    loading: false,
    error: null,
  })

  const fileOps = new FileOperations()

  /**
   * Query categories
   */
  const queryCategories = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const query: FileSystemQuery = { type: 'categories' }
      const result = await fileOps.queryFileSystem(query)

      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          categories: result.data || [],
          loading: false,
        }))
        return result.data
      } else {
        throw new Error(result.error || 'Failed to query categories')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setState((prev) => ({ ...prev, error: errorMsg, loading: false }))
      return []
    }
  }, [])

  /**
   * Query subcategories for a category
   */
  const querySubcategories = useCallback(
    async (category: string) => {
      if (!category) {
        setState((prev) => ({ ...prev, subcategories: [] }))
        return []
      }

      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const query: FileSystemQuery = {
          type: 'subcategories',
          category,
        }
        const result = await fileOps.queryFileSystem(query)

        if (result.success && result.data) {
          setState((prev) => ({
            ...prev,
            subcategories: result.data || [],
            loading: false,
          }))
          return result.data
        } else {
          throw new Error(result.error || 'Failed to query subcategories')
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setState((prev) => ({ ...prev, error: errorMsg, loading: false }))
        return []
      }
    },
    []
  )

  /**
   * Query topics for a category and subcategory
   */
  const queryTopics = useCallback(
    async (category: string, subcategory: string) => {
      if (!category || !subcategory) {
        setState((prev) => ({ ...prev, topics: [] }))
        return []
      }

      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const query: FileSystemQuery = {
          type: 'topics',
          category,
          subcategory,
        }
        const result = await fileOps.queryFileSystem(query)

        if (result.success && result.data) {
          setState((prev) => ({
            ...prev,
            topics: result.data || [],
            loading: false,
          }))
          return result.data
        } else {
          throw new Error(result.error || 'Failed to query topics')
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setState((prev) => ({ ...prev, error: errorMsg, loading: false }))
        return []
      }
    },
    []
  )

  /**
   * Save lesson file
   */
  const saveLessonFile = useCallback(
    async (category: string, subcategory: string, topic: string, data: LessonFileData): Promise<OperationResult<void>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const topicPath = `${category}/${subcategory}/${topic}`
        const result = await fileOps.saveLessonFile(topicPath, data)

        if (result.success) {
          setState((prev) => ({ ...prev, loading: false }))
        } else {
          throw new Error(result.error || 'Failed to save lesson')
        }

        return result
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        const result: OperationResult<void> = { success: false, error: errorMsg }
        setState((prev) => ({ ...prev, error: errorMsg, loading: false }))
        return result
      }
    },
    []
  )

  /**
   * Save quiz file
   */
  const saveQuizFile = useCallback(
    async (category: string, subcategory: string, topic: string, data: QuizFileData): Promise<OperationResult<void>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const topicPath = `${category}/${subcategory}/${topic}`
        const result = await fileOps.saveQuizFile(topicPath, data)

        if (result.success) {
          setState((prev) => ({ ...prev, loading: false }))
        } else {
          throw new Error(result.error || 'Failed to save quiz')
        }

        return result
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        const result: OperationResult<void> = { success: false, error: errorMsg }
        setState((prev) => ({ ...prev, error: errorMsg, loading: false }))
        return result
      }
    },
    []
  )

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    // State
    categories: state.categories,
    subcategories: state.subcategories,
    topics: state.topics,
    loading: state.loading,
    error: state.error,
    // Methods
    queryCategories,
    querySubcategories,
    queryTopics,
    saveLessonFile,
    saveQuizFile,
    clearError,
  }
}
