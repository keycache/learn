import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { FileOperations } from '../fileOperations'

describe('FileOperations - Create Methods', () => {
  let testDir: string
  let fileOps: FileOperations

  beforeEach(() => {
    // Create a temporary test directory
    testDir = path.join(process.cwd(), 'test_data_' + Date.now())
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }
    fileOps = new FileOperations(testDir)
  })

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('createCategory', () => {
    it('creates a new category folder', async () => {
      const result = await fileOps.createCategory('Spanish')

      expect(result.success).toBe(true)
      expect(result.data).toBe('spanish')

      const categoryPath = path.join(testDir, 'spanish')
      expect(fs.existsSync(categoryPath)).toBe(true)
      expect(fs.statSync(categoryPath).isDirectory()).toBe(true)
    })

    it('sanitizes category names with spaces', async () => {
      const result = await fileOps.createCategory('Spoken Languages')

      expect(result.success).toBe(true)
      expect(result.data).toBe('spoken-languages')

      const categoryPath = path.join(testDir, 'spoken-languages')
      expect(fs.existsSync(categoryPath)).toBe(true)
    })

    it('fails if category already exists', async () => {
      await fileOps.createCategory('Spanish')
      const result = await fileOps.createCategory('Spanish')

      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
    })

    it('fails if category name is empty', async () => {
      const result = await fileOps.createCategory('')

      expect(result.success).toBe(false)
      expect(result.error).toContain('cannot be empty')
    })
  })

  describe('createSubcategory', () => {
    beforeEach(async () => {
      // Create a parent category first
      await fileOps.createCategory('Spanish')
    })

    it('creates a new subcategory folder', async () => {
      const result = await fileOps.createSubcategory('spanish', 'Numbers')

      expect(result.success).toBe(true)
      expect(result.data).toBe('numbers')

      const subcategoryPath = path.join(testDir, 'spanish', 'numbers')
      expect(fs.existsSync(subcategoryPath)).toBe(true)
      expect(fs.statSync(subcategoryPath).isDirectory()).toBe(true)
    })

    it('sanitizes subcategory names with spaces', async () => {
      const result = await fileOps.createSubcategory('spanish', 'Spoken Words')

      expect(result.success).toBe(true)
      expect(result.data).toBe('spoken-words')
    })

    it('fails if parent category does not exist', async () => {
      const result = await fileOps.createSubcategory('nonexistent', 'Numbers')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('fails if subcategory already exists', async () => {
      await fileOps.createSubcategory('spanish', 'Numbers')
      const result = await fileOps.createSubcategory('spanish', 'Numbers')

      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
    })

    it('fails if subcategory name is empty', async () => {
      const result = await fileOps.createSubcategory('spanish', '')

      expect(result.success).toBe(false)
      expect(result.error).toContain('cannot be empty')
    })
  })

  describe('createTopic', () => {
    beforeEach(async () => {
      // Create parent hierarchy
      await fileOps.createCategory('Spanish')
      await fileOps.createSubcategory('spanish', 'Numbers')
    })

    it('creates a new topic folder', async () => {
      const result = await fileOps.createTopic('spanish', 'numbers', 'Counting 1-10')

      expect(result.success).toBe(true)
      expect(result.data).toBe('counting-1-10')

      const topicPath = path.join(testDir, 'spanish', 'numbers', 'counting-1-10')
      expect(fs.existsSync(topicPath)).toBe(true)
      expect(fs.statSync(topicPath).isDirectory()).toBe(true)
    })

    it('sanitizes topic names with spaces', async () => {
      const result = await fileOps.createTopic('spanish', 'numbers', 'Counting Numbers')

      expect(result.success).toBe(true)
      expect(result.data).toBe('counting-numbers')
    })

    it('fails if parent subcategory does not exist', async () => {
      const result = await fileOps.createTopic('spanish', 'nonexistent', 'Topic')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('fails if topic already exists', async () => {
      await fileOps.createTopic('spanish', 'numbers', 'Counting 1-10')
      const result = await fileOps.createTopic('spanish', 'numbers', 'Counting 1-10')

      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
    })

    it('fails if topic name is empty', async () => {
      const result = await fileOps.createTopic('spanish', 'numbers', '')

      expect(result.success).toBe(false)
      expect(result.error).toContain('cannot be empty')
    })
  })

  describe('cascade creation', () => {
    it('creates full hierarchy when all parents exist', async () => {
      const result = await fileOps.createTopic('spanish', 'numbers', 'Counting 1-10')

      expect(result.success).toBe(true)

      // Verify full path exists
      const topicPath = path.join(testDir, 'spanish', 'numbers', 'counting-1-10')
      expect(fs.existsSync(topicPath)).toBe(true)
    })

    it('preserves existing siblings when creating new topics', async () => {
      // Create first topic
      await fileOps.createTopic('spanish', 'numbers', 'Topic 1')

      // Create second topic in same subcategory
      const result = await fileOps.createTopic('spanish', 'numbers', 'Topic 2')
      expect(result.success).toBe(true)

      // Verify both exist
      const topic1Path = path.join(testDir, 'spanish', 'numbers', 'topic-1')
      const topic2Path = path.join(testDir, 'spanish', 'numbers', 'topic-2')
      expect(fs.existsSync(topic1Path)).toBe(true)
      expect(fs.existsSync(topic2Path)).toBe(true)
    })
  })
})
