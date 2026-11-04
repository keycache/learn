/**
 * useLessonDiscovery Hook
 * Discovers and reads lesson files for a given topic
 * Used in the Quizzes tab to populate multi-select with available lessons
 */

import { useCallback, useState } from 'react'
import { discoverLessons } from '@/utils/dataLoader'

export interface LessonOption {
  id: string // filename (e.g., "lesson_1", "lesson_2")
  label: string // display name (e.g., "lesson_1")
  name: string // original filename with extension
  content?: string // optional - loaded on demand
}

interface DiscoveryError {
  message: string
  lessonId?: string
}

export function useLessonDiscovery() {
  const [lessons, setLessons] = useState<LessonOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<DiscoveryError | null>(null)
  const [lessonContents, setLessonContents] = useState<Record<string, string>>({})

  /**
   * Fetch full content of a lesson file
   */
  const fetchLessonContent = useCallback(
    async (
      category: string,
      subcategory: string,
      topic: string,
      lessonId: string
    ): Promise<string> => {
      const basePath = import.meta.env.BASE_URL || '/learn/'
      const lessonPath = `${basePath}data/categories/${category}/${subcategory}/${topic}/${lessonId}.md`

      try {
        const response = await fetch(lessonPath)
        if (!response.ok) {
          throw new Error(`Failed to fetch lesson: ${response.statusText}`)
        }
        return await response.text()
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch lesson content'
        throw new Error(errorMsg)
      }
    },
    []
  )

  /**
   * Discover lessons for a given topic
   */
  const discoverTopicLessons = useCallback(
    async (category: string, subcategory: string, topic: string) => {
      if (!category || !subcategory || !topic) {
        setLessons([])
        setLessonContents({})
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Discover lessons using dataLoader
        const discoveredLessons = await discoverLessons(category, subcategory, topic)

        if (!discoveredLessons || discoveredLessons.length === 0) {
          setLessons([])
          setLessonContents({})
          setLoading(false)
          return
        }

        // Create lesson options with IDs and labels based on lesson IDs
        const lessonOptions: LessonOption[] = discoveredLessons.map((lesson) => ({
          id: lesson.id, // e.g., "lesson_1"
          label: lesson.id, // e.g., "lesson_1" (display as-is)
          name: `${lesson.id}.md`, // Store filename
        }))

        setLessons(lessonOptions)
        // Clear old contents since topic changed
        setLessonContents({})
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to discover lessons'
        setError({ message: errorMsg })
        setLessons([])
        setLessonContents({})
      } finally {
        setLoading(false)
      }
    },
    []
  )


  /**
   * Load content for a specific lesson (on-demand)
   */
  const loadLessonContent = useCallback(
    async (category: string, subcategory: string, topic: string, lessonId: string) => {
      // Check if already cached
      if (lessonContents[lessonId]) {
        return lessonContents[lessonId]
      }

      try {
        const content = await fetchLessonContent(category, subcategory, topic, lessonId)
        setLessonContents((prev) => ({
          ...prev,
          [lessonId]: content,
        }))
        return content
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load lesson'
        setError({ message: errorMsg, lessonId })
        throw err
      }
    },
    [lessonContents, fetchLessonContent]
  )

  /**
   * Get content for selected lessons (loads in parallel if not cached)
   */
  const getSelectedLessonContents = useCallback(
    async (
      category: string,
      subcategory: string,
      topic: string,
      selectedLessonIds: string[]
    ): Promise<string> => {
      try {
        // Load all selected lesson contents in parallel
        const contentPromises = selectedLessonIds.map((id) =>
          lessonContents[id]
            ? Promise.resolve(lessonContents[id])
            : fetchLessonContent(category, subcategory, topic, id)
        )

        const contents = await Promise.all(contentPromises)

        // Update cache with newly loaded contents
        if (contents.some((c) => c && !lessonContents[selectedLessonIds[contents.indexOf(c)]])) {
          const newCache = { ...lessonContents }
          selectedLessonIds.forEach((id, idx) => {
            if (contents[idx]) {
              newCache[id] = contents[idx]
            }
          })
          setLessonContents(newCache)
        }

        // Join contents with separator
        return contents.filter((c) => c).join('\n\n---\n\n')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to get lesson contents'
        setError({ message: errorMsg })
        throw err
      }
    },
    [lessonContents, fetchLessonContent]
  )

  /**
   * Clear all data
   */
  const clearLessons = useCallback(() => {
    setLessons([])
    setLessonContents({})
    setError(null)
  }, [])

  return {
    lessons,
    loading,
    error,
    discoverTopicLessons,
    loadLessonContent,
    getSelectedLessonContents,
    clearLessons,
    lessonContents,
  }
}
