import { useState, useCallback } from 'react'
import { FileSystemApi } from '../services/fileSystemApi'
import type { LessonFileData, QuizFileData, OperationResult } from '@/services/fileOperations.types'

interface UseFileSystemState {
  categories: string[]
  subcategories: string[]
  topics: string[]
  loading: boolean
  error: string | null
}

/**
 * Hook for file system operations (browser-safe)
 * Uses API client to query and modify file system via backend endpoints
 */
export const useFileSystem = () => {
  const [state, setState] = useState<UseFileSystemState>({
    categories: [],
    subcategories: [],
    topics: [],
    loading: false,
    error: null,
  })

  const fsApi = new FileSystemApi()

  /**
   * Query categories
   */
  const queryCategories = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await fsApi.queryCategories()

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
        const result = await fsApi.querySubcategories(category)

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
        const result = await fsApi.queryTopics(category, subcategory)

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
        const result = await fsApi.saveLessonFile(category, subcategory, topic, data)

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
        const result = await fsApi.saveQuizFile(category, subcategory, topic, data)

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
   * Create a new category
   */
  const createCategory = useCallback(async (categoryName: string): Promise<boolean> => {
    try {
      const result = await fsApi.createCategory(categoryName)
      if (result.success && result.data) {
        // Refresh categories list
        await queryCategories()
        return true
      } else {
        setState((prev) => ({ ...prev, error: result.error || 'Failed to create category' }))
        return false
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setState((prev) => ({ ...prev, error: errorMsg }))
      return false
    }
  }, [queryCategories])

  /**
   * Create a new subcategory
   */
  const createSubcategory = useCallback(
    async (category: string, subcategoryName: string): Promise<boolean> => {
      try {
        const result = await fsApi.createSubcategory(category, subcategoryName)
        if (result.success && result.data) {
          // Refresh subcategories list
          await querySubcategories(category)
          return true
        } else {
          setState((prev) => ({ ...prev, error: result.error || 'Failed to create subcategory' }))
          return false
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setState((prev) => ({ ...prev, error: errorMsg }))
        return false
      }
    },
    [querySubcategories]
  )

  /**
   * Create a new topic
   */
  const createTopic = useCallback(
    async (category: string, subcategory: string, topicName: string): Promise<boolean> => {
      try {
        const result = await fsApi.createTopic(category, subcategory, topicName)
        if (result.success && result.data) {
          // Refresh topics list
          await queryTopics(category, subcategory)
          return true
        } else {
          setState((prev) => ({ ...prev, error: result.error || 'Failed to create topic' }))
          return false
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setState((prev) => ({ ...prev, error: errorMsg }))
        return false
      }
    },
    [queryTopics]
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
    createCategory,
    createSubcategory,
    createTopic,
    saveLessonFile,
    saveQuizFile,
    clearError,
  }
}
