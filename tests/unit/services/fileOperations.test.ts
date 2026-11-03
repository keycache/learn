import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { FileOperations } from '@/services/fileOperations'
import type { FileSystemQuery, LessonFileData, QuizFileData } from '@/services/fileOperations.types'

/**
 * Integration tests for file operations
 * Tests file creation, reading, versioning, and cleanup
 */
describe('FileOperations - File System Integration', () => {
  const TEST_DATA_DIR = path.join(process.cwd(), '.test-fs-temp')

  beforeEach(() => {
    // Create temp directory for testing
    if (!fs.existsSync(TEST_DATA_DIR)) {
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true })
    }
  })

  afterEach(() => {
    // Cleanup: Remove all test files and directories
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true })
    }
  })

  describe('FileSystem - Read Operations', () => {
    beforeEach(() => {
      // Create test directory structure
      const structure = {
        categories: ['languages', 'science'],
        subcategories: {
          'languages/spoken': ['spanish', 'french'],
          'languages/written': ['chinese', 'arabic'],
          'science/biology': ['cells', 'ecology'],
        },
      }

      // Create category directories
      structure.categories.forEach((cat) => {
        fs.mkdirSync(path.join(TEST_DATA_DIR, cat), { recursive: true })
      })

      // Create subcategory directories
      Object.entries(structure.subcategories).forEach(([subPath, topics]) => {
        const fullPath = path.join(TEST_DATA_DIR, subPath)
        fs.mkdirSync(fullPath, { recursive: true })
        topics.forEach((topic) => {
          fs.mkdirSync(path.join(fullPath, topic), { recursive: true })
        })
      })
    })

    it('should list all categories in file system', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const query: FileSystemQuery = { type: 'categories' }
      const result = await fileOps.queryFileSystem(query)

      expect(result.success).toBe(true)
      expect(result.data).toContain('languages')
      expect(result.data).toContain('science')
      expect(result.data.length).toBeGreaterThanOrEqual(2)
    })

    it('should list subcategories for a given category', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const query: FileSystemQuery = { type: 'subcategories', category: 'languages' }
      const result = await fileOps.queryFileSystem(query)

      expect(result.success).toBe(true)
      expect(result.data).toContain('spoken')
      expect(result.data).toContain('written')
    })

    it('should list topics for a given category and subcategory', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const query: FileSystemQuery = {
        type: 'topics',
        category: 'languages',
        subcategory: 'spoken',
      }
      const result = await fileOps.queryFileSystem(query)

      expect(result.success).toBe(true)
      expect(result.data).toContain('spanish')
      expect(result.data).toContain('french')
    })

    it('should return error when category does not exist', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const query: FileSystemQuery = { type: 'subcategories', category: 'nonexistent' }
      const result = await fileOps.queryFileSystem(query)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('not found')
    })
  })

  describe('File Creation - Versioning Logic', () => {
    it('should create v1 when no version exists', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')
      fs.mkdirSync(topicPath, { recursive: true })

      const nextVersion = await fileOps.getNextLessonVersion(topicPath)

      expect(nextVersion).toBe('v1')
    })

    it('should increment version from existing files', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')
      fs.mkdirSync(topicPath, { recursive: true })

      // Create existing lesson files
      fs.writeFileSync(path.join(topicPath, 'lesson_v1.md'), '{}')
      fs.writeFileSync(path.join(topicPath, 'lesson_v2.md'), '{}')

      const nextVersion = await fileOps.getNextLessonVersion(topicPath)

      expect(nextVersion).toBe('v3')
    })

    it('should handle non-sequential versions', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')
      fs.mkdirSync(topicPath, { recursive: true })

      // Create non-sequential files
      fs.writeFileSync(path.join(topicPath, 'lesson_v1.md'), '{}')
      fs.writeFileSync(path.join(topicPath, 'lesson_v3.md'), '{}')

      const nextVersion = await fileOps.getNextLessonVersion(topicPath)

      expect(nextVersion).toBe('v4')
    })

    it('should create next quiz version for a lesson', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')
      fs.mkdirSync(topicPath, { recursive: true })

      // Create lesson directory
      const lessonDir = path.join(topicPath, 'lesson_v1')
      fs.mkdirSync(lessonDir, { recursive: true })

      // Create existing quiz files
      fs.writeFileSync(path.join(lessonDir, 'quiz_v1.json'), '{}')
      fs.writeFileSync(path.join(lessonDir, 'quiz_v2.json'), '{}')

      const nextVersion = await fileOps.getNextQuizVersion(lessonDir)

      expect(nextVersion).toBe('v3')
    })
  })

  describe('File Writing - Lesson Operations', () => {
    it('should write lesson file with correct structure', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')
      fs.mkdirSync(topicPath, { recursive: true })

      const lessonData: LessonFileData = {
        title: 'Spanish Numbers',
        summary: 'Learn to count in Spanish',
        duration: '45 minutes',
        difficulty: 'beginner',
        content: '# Spanish Numbers\n\nNumbers 1-10',
        metadata: {
          createdAt: new Date().toISOString(),
          category: 'languages',
          subcategory: 'spoken',
          topic: 'spanish',
        },
      }

      const result = await fileOps.saveLessonFile(topicPath, lessonData)

      expect(result.success).toBe(true)
      expect(result.filePath).toBeDefined()
      expect(result.filePath).toContain('lesson_v1.md')
      expect(fs.existsSync(result.filePath!)).toBe(true)
    })

    it('should auto-increment lesson version on multiple saves', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')
      fs.mkdirSync(topicPath, { recursive: true })

      const lessonData: LessonFileData = {
        title: 'Spanish Numbers',
        summary: 'Learn to count',
        duration: '45 minutes',
        difficulty: 'beginner',
        content: '# Content',
        metadata: {
          createdAt: new Date().toISOString(),
          category: 'languages',
          subcategory: 'spoken',
          topic: 'spanish',
        },
      }

      const result1 = await fileOps.saveLessonFile(topicPath, lessonData)
      const result2 = await fileOps.saveLessonFile(topicPath, lessonData)

      expect(result1.filePath).toContain('v1')
      expect(result2.filePath).toContain('v2')
      expect(fs.existsSync(result1.filePath!)).toBe(true)
      expect(fs.existsSync(result2.filePath!)).toBe(true)
    })

    it('should read back saved lesson file correctly', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')
      fs.mkdirSync(topicPath, { recursive: true })

      const lessonData: LessonFileData = {
        title: 'Spanish Numbers',
        summary: 'Learn to count in Spanish',
        duration: '45 minutes',
        difficulty: 'beginner',
        content: '# Spanish Numbers\n\nCount from 1-10',
        metadata: {
          createdAt: new Date().toISOString(),
          category: 'languages',
          subcategory: 'spoken',
          topic: 'spanish',
        },
      }

      const saveResult = await fileOps.saveLessonFile(topicPath, lessonData)
      const readResult = await fileOps.readLessonFile(saveResult.filePath!)

      expect(readResult.success).toBe(true)
      expect(readResult.data?.title).toBe(lessonData.title)
      expect(readResult.data?.content).toBe(lessonData.content)
      expect(readResult.data?.metadata.topic).toBe('spanish')
    })

    it('should synchronize metadata files when lesson is saved', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const category = 'test-languages'
      const subcategory = 'german'
      const topic = 'grammar'
      const topicPath = path.join(TEST_DATA_DIR, category, subcategory, topic)
      fs.mkdirSync(topicPath, { recursive: true })

      const lessonData: LessonFileData = {
        title: 'German Grammar Basics',
        summary: 'Learn German grammar',
        duration: '30 minutes',
        difficulty: 'beginner',
        content: '# German Grammar\n\nIntroduction to German grammar.',
        metadata: {
          createdAt: new Date().toISOString(),
          category,
          subcategory,
          topic,
        },
      }

      // Save lesson - this should trigger metadata sync
      const saveResult = await fileOps.saveLessonFile(topicPath, lessonData)
      expect(saveResult.success).toBe(true)

      // Verify category metadata was created
      const categoryMetadataPath = path.join(TEST_DATA_DIR, category, 'metadata.json')
      expect(fs.existsSync(categoryMetadataPath)).toBe(true)
      const categoryMetadata = JSON.parse(fs.readFileSync(categoryMetadataPath, 'utf-8'))
      expect(categoryMetadata.id).toBe(category)
      expect(categoryMetadata.subcategories).toContainEqual(
        expect.objectContaining({ id: subcategory })
      )

      // Verify subcategory metadata was created
      const subcategoryMetadataPath = path.join(
        TEST_DATA_DIR,
        category,
        subcategory,
        'metadata.json'
      )
      expect(fs.existsSync(subcategoryMetadataPath)).toBe(true)
      const subcategoryMetadata = JSON.parse(
        fs.readFileSync(subcategoryMetadataPath, 'utf-8')
      )
      expect(subcategoryMetadata.id).toBe(subcategory)
      expect(subcategoryMetadata.topics).toContainEqual(expect.objectContaining({ id: topic }))
    })

    it('should not duplicate entries when metadata already exists', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const category = 'existing-languages'
      const subcategory = 'french'
      const topic = 'numbers'
      const topicPath = path.join(TEST_DATA_DIR, category, subcategory, topic)
      fs.mkdirSync(topicPath, { recursive: true })

      // Create initial metadata
      const categoryMetadataPath = path.join(TEST_DATA_DIR, category, 'metadata.json')
      const subcategoryMetadataPath = path.join(
        TEST_DATA_DIR,
        category,
        subcategory,
        'metadata.json'
      )

      const lessonData: LessonFileData = {
        title: 'French Numbers',
        summary: 'Learn French numbers',
        duration: '30 minutes',
        difficulty: 'beginner',
        content: '# French Numbers',
        metadata: {
          createdAt: new Date().toISOString(),
          category,
          subcategory,
          topic,
        },
      }

      // Save first lesson
      await fileOps.saveLessonFile(topicPath, lessonData)
      const firstCategoryMetadata = JSON.parse(
        fs.readFileSync(categoryMetadataPath, 'utf-8')
      )
      const firstSubcategoryCount = firstCategoryMetadata.subcategories.length

      // Save second lesson in same topic
      const lessonData2 = { ...lessonData, title: 'French Numbers - Part 2' }
      await fileOps.saveLessonFile(topicPath, lessonData2)

      const secondCategoryMetadata = JSON.parse(
        fs.readFileSync(categoryMetadataPath, 'utf-8')
      )
      const secondSubcategoryCount = secondCategoryMetadata.subcategories.length

      // Verify no duplicate entries were added
      expect(secondSubcategoryCount).toBe(firstSubcategoryCount)

      const subcategoryMetadata = JSON.parse(
        fs.readFileSync(subcategoryMetadataPath, 'utf-8')
      )
      const topicCount = subcategoryMetadata.topics.filter((t: any) => t.id === topic).length
      expect(topicCount).toBe(1) // Only one entry for this topic
    })
  })

  describe('File Writing - Quiz Operations', () => {
    it('should write quiz file with correct structure', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const lessonDir = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish', 'lesson_v1')
      fs.mkdirSync(lessonDir, { recursive: true })

      const quizData: QuizFileData = {
        title: 'Spanish Numbers Quiz',
        summary: 'Test your knowledge',
        difficulty: 'beginner',
        questions: [
          {
            question: 'What is 5 in Spanish?',
            options: ['cinco', 'seis', 'siete'],
            correctAnswer: 0,
            explanation: 'Cinco means five',
            points: 10,
          },
        ],
        metadata: {
          createdAt: new Date().toISOString(),
          lessonVersion: 'v1',
          category: 'languages',
          subcategory: 'spoken',
          topic: 'spanish',
        },
      }

      const result = await fileOps.saveQuizFile(lessonDir, quizData)

      expect(result.success).toBe(true)
      expect(result.filePath).toBeDefined()
      expect(result.filePath).toContain('quiz_v1.json')
      expect(fs.existsSync(result.filePath!)).toBe(true)
    })

    it('should auto-increment quiz version', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const lessonDir = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish', 'lesson_v1')
      fs.mkdirSync(lessonDir, { recursive: true })

      const quizData: QuizFileData = {
        title: 'Quiz',
        summary: 'Test',
        difficulty: 'beginner',
        questions: [],
        metadata: {
          createdAt: new Date().toISOString(),
          lessonVersion: 'v1',
          category: 'languages',
          subcategory: 'spoken',
          topic: 'spanish',
        },
      }

      const result1 = await fileOps.saveQuizFile(lessonDir, quizData)
      const result2 = await fileOps.saveQuizFile(lessonDir, quizData)

      expect(result1.filePath).toContain('v1')
      expect(result2.filePath).toContain('v2')
    })

    it('should read back saved quiz file correctly', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const lessonDir = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish', 'lesson_v1')
      fs.mkdirSync(lessonDir, { recursive: true })

      const quizData: QuizFileData = {
        title: 'Spanish Numbers Quiz',
        summary: 'Test your knowledge of numbers',
        difficulty: 'beginner',
        questions: [
          {
            question: 'What is 5 in Spanish?',
            options: ['cinco', 'seis', 'siete'],
            correctAnswer: 0,
            explanation: 'Cinco means five',
            points: 10,
          },
        ],
        metadata: {
          createdAt: new Date().toISOString(),
          lessonVersion: 'v1',
          category: 'languages',
          subcategory: 'spoken',
          topic: 'spanish',
        },
      }

      const saveResult = await fileOps.saveQuizFile(lessonDir, quizData)
      const readResult = await fileOps.readQuizFile(saveResult.filePath!)

      expect(readResult.success).toBe(true)
      expect(readResult.data?.title).toBe(quizData.title)
      expect(readResult.data?.questions.length).toBe(1)
      expect(readResult.data?.questions[0].question).toBe('What is 5 in Spanish?')
    })
  })

  describe('Directory Structure Creation', () => {
    it('should create full directory structure if it does not exist', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')

      // Directory does not exist yet
      expect(fs.existsSync(topicPath)).toBe(false)

      await fileOps.ensureDirectoryExists(topicPath)

      expect(fs.existsSync(topicPath)).toBe(true)
    })

    it('should not error if directory already exists', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')

      // Create directory first time
      await fileOps.ensureDirectoryExists(topicPath)
      expect(fs.existsSync(topicPath)).toBe(true)

      // Create same directory again - should not error
      const result = await fileOps.ensureDirectoryExists(topicPath)

      expect(result.success).toBe(true)
      expect(fs.existsSync(topicPath)).toBe(true)
    })
  })

  describe('File Cleanup & Error Handling', () => {
    it('should handle non-existent read operations gracefully', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const nonexistentPath = path.join(TEST_DATA_DIR, 'nonexistent', 'lesson_v1.md')

      const result = await fileOps.readLessonFile(nonexistentPath)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('not found')
    })

    it('should handle invalid markdown gracefully', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')
      fs.mkdirSync(topicPath, { recursive: true })

      const invalidMarkdownPath = path.join(topicPath, 'lesson_v1.md')
      fs.writeFileSync(invalidMarkdownPath, 'invalid markdown without frontmatter')

      const result = await fileOps.readLessonFile(invalidMarkdownPath)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Failed to read')
    })

    it('should cleanup temporary files on error', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')
      fs.mkdirSync(topicPath, { recursive: true })

      // Create a read-only file to trigger write error
      const readOnlyPath = path.join(topicPath, 'readonly')
      fs.mkdirSync(readOnlyPath, { recursive: true })
      fs.chmodSync(readOnlyPath, 0o444)

      const lessonData: LessonFileData = {
        title: 'Test',
        summary: 'Test',
        duration: '45 minutes',
        difficulty: 'beginner',
        content: '# Test',
        metadata: {
          createdAt: new Date().toISOString(),
          category: 'languages',
          subcategory: 'spoken',
          topic: 'spanish',
        },
      }

      // This should fail due to permissions
      const result = await fileOps.saveLessonFile(readOnlyPath, lessonData)

      expect(result.success).toBe(false)

      // Cleanup
      fs.chmodSync(readOnlyPath, 0o755)
    })

    it('should cleanup all test files after each operation', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')
      fs.mkdirSync(topicPath, { recursive: true })

      const lessonData: LessonFileData = {
        title: 'Test',
        summary: 'Test',
        duration: '45 minutes',
        difficulty: 'beginner',
        content: '# Test',
        metadata: {
          createdAt: new Date().toISOString(),
          category: 'languages',
          subcategory: 'spoken',
          topic: 'spanish',
        },
      }

      await fileOps.saveLessonFile(topicPath, lessonData)

      // Verify file was created
      const files = fs.readdirSync(topicPath)
      expect(files.length).toBeGreaterThan(0)
    })
  })

  describe('Path Validation & Security', () => {
    it('should sanitize category paths to prevent directory traversal', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)

      // Attempt directory traversal
      const maliciousPath = path.join(TEST_DATA_DIR, '../../etc/passwd')
      const result = await fileOps.validatePath(maliciousPath)

      expect(result).toBe(false)
    })

    it('should accept valid normalized paths', async () => {
      const fileOps = new FileOperations(TEST_DATA_DIR)
      const validPath = path.join(TEST_DATA_DIR, 'languages', 'spoken', 'spanish')

      const result = await fileOps.validatePath(validPath)

      expect(result).toBe(true)
    })
  })
})
