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
  async getNextQuizVersion(lessonDir: string): Promise<number> {
    try {
      if (!this.fs.existsSync(lessonDir)) {
        return 1
      }

      const files = this.fs.readdirSync(lessonDir)
      const quizFiles = files.filter((f: string) => f.startsWith('quiz_v'))

      if (quizFiles.length === 0) {
        return 1
      }

      // Extract version numbers and find max
      const versions = quizFiles
        .map((f: string) => {
          const match = f.match(/quiz_v(\d+)/)
          return match ? parseInt(match[1], 10) : 0
        })
        .filter((v: number) => v > 0)

      const maxVersion = Math.max(...versions)
      return maxVersion + 1
    } catch (error) {
      console.error('Error getting next quiz version:', error)
      return 1
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryName: string): Promise<OperationResult<string>> {
    try {
      // Validate category name
      if (!categoryName || categoryName.trim() === '') {
        return { success: false, error: 'Category name cannot be empty' }
      }

      const sanitizedName = categoryName.toLowerCase().replace(/\s+/g, '-')
      const categoryPath = this.path.join(this.baseDir, sanitizedName)

      // Check if already exists
      if (this.fs.existsSync(categoryPath)) {
        return { success: false, error: `Category '${categoryName}' already exists` }
      }

      // Create directory
      this.fs.mkdirSync(categoryPath, { recursive: true })
      return { success: true, data: sanitizedName }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Create a new subcategory
   */
  async createSubcategory(category: string, subcategoryName: string): Promise<OperationResult<string>> {
    try {
      if (!subcategoryName || subcategoryName.trim() === '') {
        return { success: false, error: 'Subcategory name cannot be empty' }
      }

      const categoryPath = this.path.join(this.baseDir, category)
      if (!this.fs.existsSync(categoryPath)) {
        return { success: false, error: `Category '${category}' not found` }
      }

      const sanitizedName = subcategoryName.toLowerCase().replace(/\s+/g, '-')
      const subcategoryPath = this.path.join(categoryPath, sanitizedName)

      if (this.fs.existsSync(subcategoryPath)) {
        return { success: false, error: `Subcategory '${subcategoryName}' already exists` }
      }

      this.fs.mkdirSync(subcategoryPath, { recursive: true })
      return { success: true, data: sanitizedName }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create subcategory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Create a new topic
   */
  async createTopic(category: string, subcategory: string, topicName: string): Promise<OperationResult<string>> {
    try {
      if (!topicName || topicName.trim() === '') {
        return { success: false, error: 'Topic name cannot be empty' }
      }

      const subcategoryPath = this.path.join(this.baseDir, category, subcategory)
      if (!this.fs.existsSync(subcategoryPath)) {
        return { success: false, error: `Subcategory '${category}/${subcategory}' not found` }
      }

      const sanitizedName = topicName.toLowerCase().replace(/\s+/g, '-')
      const topicPath = this.path.join(subcategoryPath, sanitizedName)

      if (this.fs.existsSync(topicPath)) {
        return { success: false, error: `Topic '${topicName}' already exists` }
      }

      this.fs.mkdirSync(topicPath, { recursive: true })
      return { success: true, data: sanitizedName }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create topic: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
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
      const fileName = `lesson_${version}.md`
      const filePath = this.path.join(topicPath, fileName)

      // Create frontmatter (include metadata)
      const frontmatter = {
        title: data.title,
        summary: data.summary,
        duration: data.duration,
        active: true,
        difficulty: data.difficulty,
        ...(data.learningObjectives && { learningObjectives: data.learningObjectives }),
        ...(data.tags && { tags: data.tags }),
        createdAt: data.metadata.createdAt,
        category: data.metadata.category,
        subcategory: data.metadata.subcategory,
        topic: data.metadata.topic,
      }

      // Convert frontmatter to YAML format
      const yamlFrontmatter = this.toYAML(frontmatter)
      
      // Combine frontmatter and content
      const markdownContent = `---\n${yamlFrontmatter}\n---\n\n${data.content}`

      // Write file
      this.fs.writeFileSync(filePath, markdownContent)

      // Synchronize metadata files with the new lesson
      await this.syncMetadata(data.metadata.category, data.metadata.subcategory, data.metadata.topic)

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
   * Convert object to YAML string
   */
  private toYAML(obj: any, indent = 0): string {
    const lines: string[] = []
    const spaces = ' '.repeat(indent)

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        lines.push(`${spaces}${key}:`)
        for (const item of value) {
          if (typeof item === 'string') {
            lines.push(`${spaces}  - "${item}"`)
          } else {
            lines.push(`${spaces}  - ${item}`)
          }
        }
      } else if (typeof value === 'string') {
        // Quote strings
        lines.push(`${spaces}${key}: "${value}"`)
      } else if (typeof value === 'boolean') {
        lines.push(`${spaces}${key}: ${value}`)
      } else if (typeof value === 'object' && value !== null) {
        lines.push(`${spaces}${key}:`)
        lines.push(this.toYAML(value, indent + 2))
      } else {
        lines.push(`${spaces}${key}: ${value}`)
      }
    }

    return lines.join('\n')
  }

  /**
   * Synchronize metadata files when a lesson is created
   * Ensures category/subcategory metadata includes the new topic
   */
  private async syncMetadata(category: string, subcategory: string, topic: string): Promise<void> {
    try {
      // Path to subcategory metadata
      const subcategoryMetadataPath = this.path.join(
        this.baseDir,
        category,
        subcategory,
        'metadata.json'
      )

      // Load or create subcategory metadata
      let subcategoryMetadata: any
      if (this.fs.existsSync(subcategoryMetadataPath)) {
        const content = this.fs.readFileSync(subcategoryMetadataPath, 'utf-8')
        subcategoryMetadata = JSON.parse(content)
      } else {
        // Create new metadata for subcategory
        subcategoryMetadata = {
          id: subcategory,
          name: this.titleCase(subcategory),
          description: `Learn ${this.titleCase(subcategory)} vocabulary and essential phrases.`,
          category,
          topics: [],
          version: '1.0',
          createdAt: new Date().toISOString().split('T')[0],
        }
      }

      // Check if topic already exists
      if (!subcategoryMetadata.topics) {
        subcategoryMetadata.topics = []
      }

      const topicExists = subcategoryMetadata.topics.some((t: any) => t.id === topic)
      if (!topicExists) {
        // Add new topic
        subcategoryMetadata.topics.push({
          id: topic,
          name: this.titleCase(topic),
        })
      }

      // Ensure directory exists
      const subcategoryDir = this.path.join(this.baseDir, category, subcategory)
      if (!this.fs.existsSync(subcategoryDir)) {
        this.fs.mkdirSync(subcategoryDir, { recursive: true })
      }

      // Write subcategory metadata
      this.fs.writeFileSync(
        subcategoryMetadataPath,
        JSON.stringify(subcategoryMetadata, null, 2)
      )

      // Now sync category-level metadata
      const categoryMetadataPath = this.path.join(this.baseDir, category, 'metadata.json')

      let categoryMetadata: any
      if (this.fs.existsSync(categoryMetadataPath)) {
        const content = this.fs.readFileSync(categoryMetadataPath, 'utf-8')
        categoryMetadata = JSON.parse(content)
      } else {
        // Create new metadata for category
        categoryMetadata = {
          id: category,
          name: this.titleCase(category),
          description: `Learn various ${this.titleCase(category)} courses.`,
          subcategories: [],
        }
      }

      // Check if subcategory already exists
      if (!categoryMetadata.subcategories) {
        categoryMetadata.subcategories = []
      }

      const subcategoryExists = categoryMetadata.subcategories.some(
        (s: any) => s.id === subcategory
      )
      if (!subcategoryExists) {
        // Add new subcategory
        categoryMetadata.subcategories.push({
          id: subcategory,
          name: this.titleCase(subcategory),
          description: `Learn ${this.titleCase(subcategory)} vocabulary and phrases`,
          category,
          version: '1.0',
          createdAt: new Date().toISOString().split('T')[0],
        })
      }

      // Ensure category directory exists
      const categoryDir = this.path.join(this.baseDir, category)
      if (!this.fs.existsSync(categoryDir)) {
        this.fs.mkdirSync(categoryDir, { recursive: true })
      }

      // Write category metadata
      this.fs.writeFileSync(
        categoryMetadataPath,
        JSON.stringify(categoryMetadata, null, 2)
      )
    } catch (error) {
      // Log error but don't fail the save operation
      console.error('Failed to sync metadata:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  /**
   * Convert kebab-case or snake_case to Title Case
   */
  private titleCase(str: string): string {
    return str
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
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
      const fileName = `quiz_v${version}.json`
      const filePath = this.path.join(lessonDir, fileName)

      // Convert QuizFileData to GeneratedQuizSchema format
      const category = data.metadata.category
      const subcategory = data.metadata.subcategory
      const topic = data.metadata.topic
      const lessonId = `${subcategory}/${topic}`

      const generatedQuizData = {
        title: data.title,
        lesson_id: lessonId,
        quiz_version: version,
        questions: data.questions,
        metadata: {
          totalQuestions: data.questions.length,
          createdAt: data.metadata.createdAt,
          lessonId: lessonId,
        },
      }

      // Write file
      this.fs.writeFileSync(filePath, JSON.stringify(generatedQuizData, null, 2))

      // Synchronize metadata files with the new quiz
      await this.syncMetadata(category, subcategory, topic)

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
      
      // Parse markdown with YAML frontmatter
      const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
      if (!match) {
        return { success: false, error: 'Failed to read lesson file: Invalid markdown format - missing frontmatter' }
      }

      const [, yamlContent, markdownContent] = match
      
      // Simple YAML parser for frontmatter
      const frontmatter: any = {}
      const yamlLines = yamlContent.split('\n')
      
      for (const line of yamlLines) {
        if (!line.trim()) continue
        
        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':')
          let value: any = valueParts.join(':').trim()
          
          // Handle different value types
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1)
          } else if (value === 'true') {
            value = true
          } else if (value === 'false') {
            value = false
          } else if (value.startsWith('[')) {
            // Handle arrays - simple parsing
            try {
              value = JSON.parse(value.replace(/- "/g, '"').replace(/"/g, '"'))
            } catch {
              // Keep as string if JSON parse fails
            }
          }
          
          frontmatter[key.trim()] = value
        }
      }

      const data: LessonFileData = {
        title: frontmatter.title || '',
        summary: frontmatter.summary || '',
        duration: frontmatter.duration || '',
        difficulty: frontmatter.difficulty || 'beginner',
        content: markdownContent.trim(),
        learningObjectives: frontmatter.learningObjectives,
        tags: frontmatter.tags,
        metadata: {
          createdAt: frontmatter.createdAt || new Date().toISOString(),
          category: frontmatter.category || 'unknown',
          subcategory: frontmatter.subcategory || 'unknown',
          topic: frontmatter.topic || 'unknown',
        },
      }

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
