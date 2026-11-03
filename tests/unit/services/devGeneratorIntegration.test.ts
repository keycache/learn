import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { FileOperations } from '@/services/fileOperations'
import type { LessonFileData, QuizFileData } from '@/services/fileOperations.types'

/**
 * Integration tests for end-to-end lesson generation and file saving workflow
 */
describe('Dev Generator - Lesson Generation Workflow', () => {
  const TEST_DATA_DIR = path.join(process.cwd(), '.test-workflow-lessons')

  beforeEach(() => {
    if (!fs.existsSync(TEST_DATA_DIR)) {
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true })
    }
  })

  afterEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true })
    }
  })

  it('should create lesson category structure and save lesson file', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)
    
    // Setup directory structure
    const category = 'languages'
    const subcategory = 'spanish'
    const topic = 'numbers'
    const topicPath = path.join(TEST_DATA_DIR, category, subcategory, topic)

    // Create directory
    const ensureResult = await fileOps.ensureDirectoryExists(topicPath)
    expect(ensureResult.success).toBe(true)

    // Create lesson data
    const lessonData: LessonFileData = {
      title: 'Spanish Numbers: 1-100',
      summary: 'Learn to count from 1 to 100 in Spanish',
      duration: '45 minutes',
      difficulty: 'beginner',
      content: '# Spanish Numbers\n\nThis is a lesson about Spanish numbers.',
      metadata: {
        createdAt: new Date().toISOString(),
        category,
        subcategory,
        topic,
      },
    }

    // Save lesson
    const saveResult = await fileOps.saveLessonFile(topicPath, lessonData)
    expect(saveResult.success).toBe(true)
    expect(saveResult.filePath).toBeDefined()

    // Verify file exists
    const files = fs.readdirSync(topicPath)
    expect(files.length).toBeGreaterThan(0)
    expect(files[0]).toMatch(/lesson_v\d+\.md/)

    // Read and verify content using the returned file path
    const readResult = await fileOps.readLessonFile(saveResult.filePath!)
    expect(readResult.success).toBe(true)
    expect(readResult.data?.title).toBe(lessonData.title)
    expect(readResult.data?.summary).toBe(lessonData.summary)
  })

  it('should auto-increment lesson versions on multiple saves', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)
    
    const category = 'languages'
    const subcategory = 'spanish'
    const topic = 'numbers'
    const topicPath = path.join(TEST_DATA_DIR, category, subcategory, topic)

    await fileOps.ensureDirectoryExists(topicPath)

    // Save first version
    const lesson1: LessonFileData = {
      title: 'Spanish Numbers v1',
      summary: 'Version 1',
      duration: '45 minutes',
      difficulty: 'beginner',
      content: 'Content v1',
      metadata: {
        createdAt: new Date().toISOString(),
        category,
        subcategory,
        topic,
      },
    }
    const save1 = await fileOps.saveLessonFile(topicPath, lesson1)
    expect(save1.success).toBe(true)
    expect(save1.filePath).toBeDefined()

    // Save second version
    const lesson2: LessonFileData = {
      title: 'Spanish Numbers v2',
      summary: 'Version 2',
      duration: '50 minutes',
      difficulty: 'intermediate',
      content: 'Content v2',
      metadata: {
        createdAt: new Date().toISOString(),
        category,
        subcategory,
        topic,
      },
    }
    const save2 = await fileOps.saveLessonFile(topicPath, lesson2)
    expect(save2.success).toBe(true)
    expect(save2.filePath).toBeDefined()

    // Save third version
    const lesson3: LessonFileData = {
      title: 'Spanish Numbers v3',
      summary: 'Version 3',
      duration: '55 minutes',
      difficulty: 'advanced',
      content: 'Content v3',
      metadata: {
        createdAt: new Date().toISOString(),
        category,
        subcategory,
        topic,
      },
    }
    const save3 = await fileOps.saveLessonFile(topicPath, lesson3)
    expect(save3.success).toBe(true)
    expect(save3.filePath).toBeDefined()

    // Verify all three versions exist
    const files = fs.readdirSync(topicPath).sort()
    expect(files.length).toBe(3)
    expect(files[0]).toMatch(/lesson_v1\.md/)
    expect(files[1]).toMatch(/lesson_v2\.md/)
    expect(files[2]).toMatch(/lesson_v3\.md/)

    // Verify content of each version
    const read1 = await fileOps.readLessonFile(save1.filePath!)
    expect(read1.data?.title).toBe('Spanish Numbers v1')

    const read2 = await fileOps.readLessonFile(save2.filePath!)
    expect(read2.data?.title).toBe('Spanish Numbers v2')

    const read3 = await fileOps.readLessonFile(save3.filePath!)
    expect(read3.data?.title).toBe('Spanish Numbers v3')
  })

  it('should handle lesson generation with markdown content', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)
    
    const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spanish', 'grammar')
    await fileOps.ensureDirectoryExists(topicPath)

    // Simulate LLM-generated markdown content
    const markdownContent = `# Spanish Grammar: Present Tense

## Learning Objectives
- Conjugate -AR verbs
- Identify regular patterns
- Practice pronunciation

## Regular -AR Verbs

| Person | Conjugation | Example |
|--------|-------------|---------|
| Yo | -o | hablo |
| Tú | -as | hablas |
| Él/Ella | -a | habla |

## Practice
Try conjugating: hablar, cantar, bailar`

    const lessonData: LessonFileData = {
      title: 'Spanish Grammar: Present Tense',
      summary: 'Learn to conjugate regular -AR verbs in Spanish present tense',
      duration: '60 minutes',
      difficulty: 'intermediate',
      content: markdownContent,
      metadata: {
        createdAt: new Date().toISOString(),
        category: 'languages',
        subcategory: 'spanish',
        topic: 'grammar',
      },
    }

    const saveResult = await fileOps.saveLessonFile(topicPath, lessonData)
    expect(saveResult.success).toBe(true)
    expect(saveResult.filePath).toBeDefined()

    // Read back and verify markdown preserved
    const readResult = await fileOps.readLessonFile(saveResult.filePath!)
    expect(readResult.success).toBe(true)
    expect(readResult.data?.content).toContain('# Spanish Grammar')
    expect(readResult.data?.content).toContain('| Person | Conjugation |')
    expect(readResult.data?.content).toContain('| Yo | -o |')
  })

  it('should handle lesson with metadata and timestamps', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)
    
    const topicPath = path.join(TEST_DATA_DIR, 'science', 'biology', 'cells')
    await fileOps.ensureDirectoryExists(topicPath)

    const now = new Date().toISOString()
    const lessonData: LessonFileData = {
      title: 'Cell Biology Basics',
      summary: 'Understanding cell structure and function',
      duration: '90 minutes',
      difficulty: 'intermediate',
      content: '# Cell Biology\n\nCells are the basic unit of life.',
      metadata: {
        createdAt: now,
        category: 'science',
        subcategory: 'biology',
        topic: 'cells',
      },
    }

    const saveResult = await fileOps.saveLessonFile(topicPath, lessonData)
    expect(saveResult.success).toBe(true)
    expect(saveResult.filePath).toBeDefined()

    const readResult = await fileOps.readLessonFile(saveResult.filePath!)
    expect(readResult.success).toBe(true)
    expect(readResult.data?.metadata.createdAt).toBe(now)
    expect(readResult.data?.metadata.category).toBe('science')
    expect(readResult.data?.metadata.subcategory).toBe('biology')
    expect(readResult.data?.metadata.topic).toBe('cells')
  })
})

/**
 * Integration tests for end-to-end quiz generation and file saving workflow
 */
describe('Dev Generator - Quiz Generation Workflow', () => {
  const TEST_DATA_DIR = path.join(process.cwd(), '.test-workflow-quizzes')

  beforeEach(() => {
    if (!fs.existsSync(TEST_DATA_DIR)) {
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true })
    }
  })

  afterEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true })
    }
  })

  it('should save quiz file with questions and answers', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)
    
    const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spanish', 'numbers')
    await fileOps.ensureDirectoryExists(topicPath)

    const quizData: QuizFileData = {
      title: 'Spanish Numbers Quiz',
      summary: 'Test your knowledge of Spanish numbers 1-100',
      difficulty: 'beginner',
      questions: [
        {
          question: 'What is "five" in Spanish?',
          options: ['cinco', 'seis', 'siete', 'ocho'],
          correctAnswer: 0,
          explanation: 'Cinco is the Spanish word for five.',
          points: 10,
        },
        {
          question: 'What is "twenty-one" in Spanish?',
          options: ['veinte y uno', 'veintiuno', 'veinti uno', 'veinte uno'],
          correctAnswer: 1,
          explanation: 'Veintiuno is the proper spelling for twenty-one.',
          points: 10,
        },
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        lessonVersion: 'v1',
        category: 'languages',
        subcategory: 'spanish',
        topic: 'numbers',
      },
    }

    const saveResult = await fileOps.saveQuizFile(topicPath, quizData)
    expect(saveResult.success).toBe(true)
    expect(saveResult.filePath).toBeDefined()

    // Verify file exists
    const files = fs.readdirSync(topicPath)
    expect(files.some((f) => f.match(/quiz_v\d+\.json/))).toBe(true)

    // Read and verify content
    const readResult = await fileOps.readQuizFile(saveResult.filePath!)
    expect(readResult.success).toBe(true)
    expect(readResult.data?.title).toBe(quizData.title)
    expect(readResult.data?.questions.length).toBe(2)
    expect(readResult.data?.questions[0].question).toBe('What is "five" in Spanish?')
  })

  it('should auto-increment quiz versions independently from lessons', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)
    
    const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spanish', 'numbers')
    await fileOps.ensureDirectoryExists(topicPath)

    // Save first quiz version
    const quiz1: QuizFileData = {
      title: 'Quiz v1',
      summary: 'Version 1',
      difficulty: 'beginner',
      questions: [
        {
          question: 'Q1',
          options: ['A', 'B'],
          correctAnswer: 0,
          explanation: 'Correct',
          points: 10,
        },
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        lessonVersion: 'v1',
        category: 'languages',
        subcategory: 'spanish',
        topic: 'numbers',
      },
    }
    const save1 = await fileOps.saveQuizFile(topicPath, quiz1)
    expect(save1.success).toBe(true)
    expect(save1.filePath).toBeDefined()

    // Save second quiz version
    const quiz2: QuizFileData = {
      title: 'Quiz v2',
      summary: 'Version 2',
      difficulty: 'intermediate',
      questions: [
        {
          question: 'Q2',
          options: ['A', 'B'],
          correctAnswer: 1,
          explanation: 'Correct',
          points: 10,
        },
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        lessonVersion: 'v2',
        category: 'languages',
        subcategory: 'spanish',
        topic: 'numbers',
      },
    }
    const save2 = await fileOps.saveQuizFile(topicPath, quiz2)
    expect(save2.success).toBe(true)
    expect(save2.filePath).toBeDefined()

    // Verify both versions exist and have correct names
    const files = fs.readdirSync(topicPath).sort()
    const quizFiles = files.filter((f) => f.match(/quiz_v\d+\.json/))
    expect(quizFiles.length).toBe(2)
    expect(quizFiles[0]).toBe('quiz_v1.json')
    expect(quizFiles[1]).toBe('quiz_v2.json')
  })

  it('should handle quiz with various question types and point values', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)
    
    const topicPath = path.join(TEST_DATA_DIR, 'science', 'biology', 'genetics')
    await fileOps.ensureDirectoryExists(topicPath)

    const quizData: QuizFileData = {
      title: 'Genetics Fundamentals Quiz',
      summary: 'Test your understanding of basic genetics',
      difficulty: 'intermediate',
      questions: [
        {
          question: 'What is a dominant trait?',
          options: [
            'A trait that is always expressed',
            'A trait that appears in both parents',
            'A trait that is recessive',
            'A trait that is X-linked',
          ],
          correctAnswer: 0,
          explanation: 'A dominant trait is expressed in both homozygous and heterozygous individuals.',
          points: 15,
        },
        {
          question: 'In a Punnett square, what does each box represent?',
          options: ['A chromosome', 'A possible offspring genotype', 'A protein', 'A mutation'],
          correctAnswer: 1,
          explanation: 'Each box in a Punnett square shows a possible genotype of offspring.',
          points: 20,
        },
        {
          question: 'What is the genotype ratio for a cross between two heterozygotes?',
          options: ['1:1', '1:2:1', '3:1', '9:3:3:1'],
          correctAnswer: 2,
          explanation: 'A heterozygous cross (Aa × Aa) produces a 3:1 phenotype ratio and 1:2:1 genotype ratio.',
          points: 25,
        },
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        lessonVersion: 'v1',
        category: 'science',
        subcategory: 'biology',
        topic: 'genetics',
      },
    }

    const saveResult = await fileOps.saveQuizFile(topicPath, quizData)
    expect(saveResult.success).toBe(true)
    expect(saveResult.filePath).toBeDefined()

    const readResult = await fileOps.readQuizFile(saveResult.filePath!)
    expect(readResult.success).toBe(true)
    expect(readResult.data?.questions.length).toBe(3)
    expect(readResult.data?.questions[0].points).toBe(15)
    expect(readResult.data?.questions[1].points).toBe(20)
    expect(readResult.data?.questions[2].points).toBe(25)
  })
})

/**
 * Integration tests for cascading file system queries and dropdown population
 */
describe('Dev Generator - Cascading Dropdown Integration', () => {
  const TEST_DATA_DIR = path.join(process.cwd(), '.test-workflow-cascading')

  beforeEach(() => {
    if (!fs.existsSync(TEST_DATA_DIR)) {
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true })
    }

    // Create sample directory structure
    const structure = {
      categories: ['languages', 'science'],
      subcategories: {
        'languages/spoken': ['spanish', 'french', 'mandarin'],
        'languages/written': ['arabic', 'japanese'],
        'science/biology': ['cells', 'genetics', 'ecology'],
        'science/physics': ['mechanics', 'thermodynamics'],
      },
    }

    structure.categories.forEach((cat) => {
      fs.mkdirSync(path.join(TEST_DATA_DIR, cat), { recursive: true })
    })

    Object.entries(structure.subcategories).forEach(([subPath, topics]) => {
      const fullPath = path.join(TEST_DATA_DIR, subPath)
      fs.mkdirSync(fullPath, { recursive: true })
      topics.forEach((topic) => {
        fs.mkdirSync(path.join(fullPath, topic), { recursive: true })
      })
    })
  })

  afterEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true })
    }
  })

  it('should populate category dropdown', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)

    const result = await fileOps.queryFileSystem({ type: 'categories' })

    expect(result.success).toBe(true)
    expect(result.data).toContain('languages')
    expect(result.data).toContain('science')
    expect(result.data?.length).toBe(2)
  })

  it('should populate subcategory dropdown based on selected category', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)

    // Query subcategories for languages
    const langResult = await fileOps.queryFileSystem({
      type: 'subcategories',
      category: 'languages',
    })

    expect(langResult.success).toBe(true)
    expect(langResult.data).toContain('spoken')
    expect(langResult.data).toContain('written')

    // Query subcategories for science
    const sciResult = await fileOps.queryFileSystem({
      type: 'subcategories',
      category: 'science',
    })

    expect(sciResult.success).toBe(true)
    expect(sciResult.data).toContain('biology')
    expect(sciResult.data).toContain('physics')
  })

  it('should populate topic dropdown based on selected category and subcategory', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)

    // Query topics for languages/spoken
    const result = await fileOps.queryFileSystem({
      type: 'topics',
      category: 'languages',
      subcategory: 'spoken',
    })

    expect(result.success).toBe(true)
    expect(result.data).toContain('spanish')
    expect(result.data).toContain('french')
    expect(result.data).toContain('mandarin')

    // Query topics for science/biology
    const bioResult = await fileOps.queryFileSystem({
      type: 'topics',
      category: 'science',
      subcategory: 'biology',
    })

    expect(bioResult.success).toBe(true)
    expect(bioResult.data).toContain('cells')
    expect(bioResult.data).toContain('genetics')
    expect(bioResult.data).toContain('ecology')
  })

  it('should handle cascading dropdown reset when category changes', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)

    // Start with languages
    let result = await fileOps.queryFileSystem({
      type: 'subcategories',
      category: 'languages',
    })
    expect(result.data).toContain('spoken')

    // Switch to science - should get different subcategories
    result = await fileOps.queryFileSystem({
      type: 'subcategories',
      category: 'science',
    })
    expect(result.data).toContain('biology')
    expect(result.data).not.toContain('spoken')
  })
})

/**
 * Integration tests for error scenarios and recovery
 */
describe('Dev Generator - Error Handling & Recovery', () => {
  const TEST_DATA_DIR = path.join(process.cwd(), '.test-workflow-errors')

  beforeEach(() => {
    if (!fs.existsSync(TEST_DATA_DIR)) {
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true })
    }
  })

  afterEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true })
    }
  })

  it('should handle gracefully when querying non-existent category', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)

    const result = await fileOps.queryFileSystem({
      type: 'subcategories',
      category: 'nonexistent',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should handle gracefully when saving to invalid path', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)

    const invalidPath = path.join(TEST_DATA_DIR, '../../etc/passwd')
    
    const lessonData: LessonFileData = {
      title: 'Test',
      summary: 'Test',
      duration: '1 hour',
      difficulty: 'beginner',
      content: 'Test',
      metadata: {
        createdAt: new Date().toISOString(),
        category: 'test',
        subcategory: 'test',
        topic: 'test',
      },
    }

    const isValid = await fileOps.validatePath(invalidPath)
    expect(isValid).toBe(false)
  })

  it('should handle reading non-existent quiz file', async () => {
    const fileOps = new FileOperations(TEST_DATA_DIR)

    const topicPath = path.join(TEST_DATA_DIR, 'languages', 'spanish', 'numbers')

    const result = await fileOps.readQuizFile(topicPath, 'v999')

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
