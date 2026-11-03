/**
 * Browser-safe file system API client
 * Makes HTTP requests to backend file system endpoints
 */

import type { OperationResult } from '@/services/fileOperations.types'

const API_BASE = '/api/dev/fs'

export class FileSystemApi {
  /**
   * Query categories
   */
  async queryCategories(): Promise<OperationResult<string[]>> {
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'GET',
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch categories'
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Query subcategories for a category
   */
  async querySubcategories(category: string): Promise<OperationResult<string[]>> {
    try {
      const response = await fetch(`${API_BASE}/subcategories/${encodeURIComponent(category)}`, {
        method: 'GET',
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch subcategories'
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Query topics for a category/subcategory
   */
  async queryTopics(category: string, subcategory: string): Promise<OperationResult<string[]>> {
    try {
      const response = await fetch(
        `${API_BASE}/topics/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}`,
        {
          method: 'GET',
        }
      )
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch topics'
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryName: string): Promise<OperationResult<string>> {
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryName }),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create category'
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Create a new subcategory
   */
  async createSubcategory(category: string, subcategoryName: string): Promise<OperationResult<string>> {
    try {
      const response = await fetch(`${API_BASE}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, subcategoryName }),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create subcategory'
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Create a new topic
   */
  async createTopic(
    category: string,
    subcategory: string,
    topicName: string
  ): Promise<OperationResult<string>> {
    try {
      const response = await fetch(`${API_BASE}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, subcategory, topicName }),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create topic'
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Save a lesson file
   */
  async saveLessonFile(
    category: string,
    subcategory: string,
    topic: string,
    lesson: any
  ): Promise<OperationResult<void>> {
    try {
      const response = await fetch(`${API_BASE}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, subcategory, topic, lesson }),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save lesson'
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Save a quiz file
   */
  async saveQuizFile(
    category: string,
    subcategory: string,
    topic: string,
    quiz: any
  ): Promise<OperationResult<void>> {
    try {
      const response = await fetch(`${API_BASE}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, subcategory, topic, quiz }),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save quiz'
      return {
        success: false,
        error: errorMsg,
      }
    }
  }
}
