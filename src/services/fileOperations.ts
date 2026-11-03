/**
 * FileOperations Service
 * Handles file reading, writing, and versioning for lessons and quizzes
 * Note: This service uses Node.js APIs and should only run in server context (dev server, build time)
 */

// Dynamic imports to avoid errors in browser context
const getNodeModules = () => {
  // Check if we have access to Node.js globals more reliably
  const hasNodeGlobals = typeof process !== 'undefined' && process.versions && process.versions.node
  
  if (hasNodeGlobals) {
    // Running in Node.js
    try {
      return {
        fs: require('fs'),
        path: require('path'),
      }
    } catch {
      throw new Error('FileOperations requires Node.js fs and path modules')
    }
  }
  throw new Error('FileOperations cannot be used in browser or jsdom context')
}

import type { FileSystemQuery, LessonFileData, QuizQuestion, QuizFileData, OperationResult } from './fileOperations.types'

/**
 * FileOperations Service
 */
export class FileOperations {
  private baseDir: string
  private fs: any
  private path: any

  constructor(
    baseDir: string = (() => {
      const hasNodeGlobals = typeof process !== 'undefined' && process.versions && process.versions.node
      if (hasNodeGlobals) {
        const p = require('path')
        return p.join(process.cwd(), 'src', 'data', 'categories')
      }
      return ''
    })()
  ) {
    this.baseDir = baseDir
    const modules = getNodeModules()
    this.fs = modules.fs
    this.path = modules.path
  }

  /**
   * Query file system for categories, subcategories, or topics
   */
  async queryFileSystem(query: FileSystemQuery): Promise<OperationResult<string[]>> {
    try {
      if (query.type === 'categories') {
        return this.getCategories()
      } else if (query.type === 'subcategories' && query.category) {
        return this.getSubcategories(query.category)
      } else if (query.type === 'topics' && query.category && query.subcategory) {
        return this.getTopics(query.category, query.subcategory)
      }

      return {
        success: false,
        error: 'Invalid query parameters',
      }
    } catch (error) {
      return {
        success: false,
        error: `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Get all categories
   */
  private async getCategories(): Promise<OperationResult<string[]>> {
    try {
      if (!this.fs.existsSync(this.baseDir)) {
        return { success: false, error: 'Base directory not found' }
      }

      const categories = this.fs
        .readdirSync(this.baseDir)
        .filter((item: string) => {
          const fullPath = this.path.join(this.baseDir, item)
          return this.fs.statSync(fullPath).isDirectory()
        })
        .sort()

      return { success: true, data: categories }
    } catch (error) {
      return {
        success: false,
        error: `Failed to list categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Get subcategories for a category
   */
  private async getSubcategories(category: string): Promise<OperationResult<string[]>> {
    try {
      const categoryPath = this.path.join(this.baseDir, category)

      if (!this.fs.existsSync(categoryPath)) {
        return { success: false, error: `Category '${category}' not found` }
      }

      const subcategories = this.fs
        .readdirSync(categoryPath)
        .filter((item: string) => {
          const fullPath = this.path.join(categoryPath, item)
          return this.fs.statSync(fullPath).isDirectory() && !item.startsWith('.')
        })
        .sort()

      return { success: true, data: subcategories }
    } catch (error) {
      return {
        success: false,
        error: `Failed to list subcategories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Get topics for a category and subcategory
   */
  private async getTopics(
    category: string,
    subcategory: string
  ): Promise<OperationResult<string[]>> {
    try {
      const subcategoryPath = this.path.join(this.baseDir, category, subcategory)

      if (!this.fs.existsSync(subcategoryPath)) {
        return {
          success: false,
          error: `Subcategory '${category}/${subcategory}' not found`,
        }
      }

      const topics = this.fs
        .readdirSync(subcategoryPath)
        .filter((item: string) => {
          const fullPath = this.path.join(subcategoryPath, item)
          return this.fs.statSync(fullPath).isDirectory() && !item.startsWith('.')
        })
        .sort()

      return { success: true, data: topics }
    } catch (error) {
      return {
        success: false,
        error: `Failed to list topics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Get next lesson version for a topic
   */
  async getNextLessonVersion(topicPath: string): Promise<string> {
    try {
      if (!this.fs.existsSync(topicPath)) {
        return 'v1'
      }

      const files = this.fs.readdirSync(topicPath)
      const lessonFiles = files.filter((f: string) => f.startsWith('lesson_v'))

      if (lessonFiles.length === 0) {
        return 'v1'
      }

      // Extract version numbers and find max
      const versions = lessonFiles
        .map((f: string) => {
          const match = f.match(/lesson_v(\d+)/)
          return match ? parseInt(match[1], 10) : 0
        })
        .filter((v: number) => v > 0)

      const maxVersion = Math.max(...versions)
      return `v${maxVersion + 1}`
    } catch (error) {
      console.error('Error getting next lesson version:', error)
      return 'v1'
    }
  }

  /**
   * Get next quiz version for a lesson
   */
  async getNextQuizVersion(lessonDir: string): Promise<string> {
    try {
      if (!this.fs.existsSync(lessonDir)) {
        return 'v1'
      }

      const files = this.fs.readdirSync(lessonDir)
      const quizFiles = files.filter((f: string) => f.startsWith('quiz_v'))

      if (quizFiles.length === 0) {
        return 'v1'
      }

      // Extract version numbers and find max
      const versions = quizFiles
        .map((f: string) => {
          const match = f.match(/quiz_v(\d+)/)
          return match ? parseInt(match[1], 10) : 0
        })
        .filter((v: number) => v > 0)

      const maxVersion = Math.max(...versions)
      return `v${maxVersion + 1}`
    } catch (error) {
      console.error('Error getting next quiz version:', error)
      return 'v1'
    }
  }

  /**
   * Ensure directory exists, create if needed
   */
  async ensureDirectoryExists(dirPath: string): Promise<OperationResult<void>> {
    try {
      if (!this.fs.existsSync(dirPath)) {
        this.fs.mkdirSync(dirPath, { recursive: true })
      }
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Save lesson file with auto-versioning
   */
  async saveLessonFile(topicPath: string, data: LessonFileData): Promise<OperationResult<void>> {
    try {
      // Ensure directory exists
      const ensureResult = await this.ensureDirectoryExists(topicPath)
      if (!ensureResult.success) {
        return ensureResult
      }

      // Get next version
      const version = await this.getNextLessonVersion(topicPath)
      const fileName = `lesson_${version}.json`
      const filePath = this.path.join(topicPath, fileName)

      // Write file
      this.fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

      return {
        success: true,
        filePath,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to save lesson file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Save quiz file with auto-versioning
   */
  async saveQuizFile(lessonDir: string, data: QuizFileData): Promise<OperationResult<void>> {
    try {
      // Ensure directory exists
      const ensureResult = await this.ensureDirectoryExists(lessonDir)
      if (!ensureResult.success) {
        return ensureResult
      }

      // Get next version
      const version = await this.getNextQuizVersion(lessonDir)
      const fileName = `quiz_${version}.json`
      const filePath = this.path.join(lessonDir, fileName)

      // Write file
      this.fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

      return {
        success: true,
        filePath,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to save quiz file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Read lesson file
   */
  async readLessonFile(filePath: string): Promise<OperationResult<LessonFileData>> {
    try {
      if (!this.fs.existsSync(filePath)) {
        return { success: false, error: `File not found: ${filePath}` }
      }

      const content = this.fs.readFileSync(filePath, 'utf-8')
      const data = JSON.parse(content) as LessonFileData

      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: `Failed to read lesson file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Read quiz file
   */
  async readQuizFile(filePath: string): Promise<OperationResult<QuizFileData>> {
    try {
      if (!this.fs.existsSync(filePath)) {
        return { success: false, error: `File not found: ${filePath}` }
      }

      const content = this.fs.readFileSync(filePath, 'utf-8')
      const data = JSON.parse(content) as QuizFileData

      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: `Failed to read quiz file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Validate path to prevent directory traversal attacks
   */
  async validatePath(checkPath: string): Promise<boolean> {
    try {
      const normalized = this.path.normalize(checkPath)
      const resolved = this.path.resolve(normalized)
      const baseResolved = this.path.resolve(this.baseDir)

      // Use realpath to resolve symlinks only if the path exists
      let realPath: string
      let realBase: string

      try {
        realPath = this.fs.realpathSync(resolved)
      } catch {
        // If the path doesn't exist, just use the resolved path
        realPath = resolved
      }

      try {
        realBase = this.fs.realpathSync(baseResolved)
      } catch {
        // If base doesn't exist, use resolved base
        realBase = baseResolved
      }

      // Check if the resolved path is within the base directory
      return realPath.startsWith(realBase + this.path.sep) || realPath === realBase
    } catch {
      return false
    }
  }

  /**
   * Delete file (for cleanup during tests or error recovery)
   */
  async deleteFile(filePath: string): Promise<OperationResult<void>> {
    try {
      if (this.fs.existsSync(filePath)) {
        this.fs.unlinkSync(filePath)
      }
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Delete directory recursively (for cleanup)
   */
  async deleteDirectory(dirPath: string): Promise<OperationResult<void>> {
    try {
      if (this.fs.existsSync(dirPath)) {
        this.fs.rmSync(dirPath, { recursive: true, force: true })
      }
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}
