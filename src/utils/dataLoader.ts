import {
  Category,
  Subcategory,
  Topic,
  Level,
  Question,
  TopicInfo,
  Lesson,
  MarkdownContent,
} from '../types/learning';
import {
  parseFrontmatter,
  extractLessonOrder,
  extractLessonId,
} from './frontmatterParser';

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Randomizes options for all questions while keeping track of correct answers
 */
export function randomizeQuestionOptions(questions: Question[]): Question[] {
  return questions.map((question) => ({
    ...question,
    options: shuffle(question.options),
  }));
}

/**
 * Load categories from the data directory
 * Currently supports: spoken-languages, system-design, algorithms, programming-languages
 */
export async function loadCategories(): Promise<Record<string, Category>> {
  const categories: Record<string, Category> = {};

  // Dynamically import all metadata.json files from categories
  // For now, we'll manually load the spoken-languages category
  try {
    const spokenLanguages = await import(
      '../data/categories/spoken-languages/metadata.json'
    );
    const subcategories = (spokenLanguages.subcategories as Subcategory[]) || [];
    categories['spoken-languages'] = {
      id: 'spoken-languages',
      name: 'Spoken Languages',
      description: 'Learn various spoken languages around the world',
      subcategories: subcategories,
    };
  } catch (error) {
    console.error('Failed to load spoken-languages category:', error);
  }

  return categories;
}

/**
 * Load subcategories for a given category
 * Example: loadSubcategories('spoken-languages') -> returns [french, spanish, german, ...]
 */
export async function loadSubcategories(
  categoryId: string
): Promise<Subcategory[]> {
  try {
    const metadata = await import(
      `../data/categories/${categoryId}/metadata.json`
    );
    return (metadata.subcategories as Subcategory[]) || [];
  } catch (error) {
    console.error(`Failed to load subcategories for ${categoryId}:`, error);
    return [];
  }
}

/**
 * Load topics for a given category and subcategory
 * Uses dynamic discovery from file system first (via API), then falls back to metadata.json
 * This ensures new topics appear immediately when lessons are created
 * 
 * Example: loadTopics('spoken-languages', 'french') -> returns [{id: 'numbers', name: 'Numbers'}, ...]
 */
export async function loadTopics(
  categoryId: string,
  subcategoryId: string
): Promise<TopicInfo[]> {
  try {
    // First, try to discover topics dynamically from file system via API
    // This works in both dev and production builds
    try {
      const response = await fetch(
        `/learn/api/dev/fs/topics/${categoryId}/${subcategoryId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          // Convert from API format to TopicInfo format
          const topics = (data.data as string[]).map((topicId: string) => ({
            id: topicId,
            name: topicId
              .split(/[-_]/)
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' '),
          }));
          if (topics.length > 0) {
            return topics;
          }
        }
      }
    } catch (apiError) {
      // API not available in production - will fall back to metadata
      console.debug('Topic discovery API not available, falling back to metadata');
    }

    // Fall back to static metadata.json if API unavailable
    const metadata = await import(
      `../data/categories/${categoryId}/${subcategoryId}/metadata.json`
    );
    return (metadata.topics as TopicInfo[]) || [];
  } catch (error) {
    console.error(
      `Failed to load topics for ${categoryId}/${subcategoryId}:`,
      error
    );
    return [];
  }
}

/**
 * Load a complete topic with all its levels and questions
 * Also attempts to discover lessons if topic folder structure exists
 * 
 * Supports three structures:
 * 1. Lessons only: categoryId/subcategoryId/topicId/ with lesson_*.md files (no quiz)
 * 2. Old: categoryId/subcategoryId/topicId.json (single file with levels and questions)
 * 3. New: categoryId/subcategoryId/topicId/quiz.json (quiz in folder with lessons)
 * 
 * Example: loadTopic('spoken-languages', 'french', 'numbers')
 */
export async function loadTopic(
  categoryId: string,
  subcategoryId: string,
  topicId: string
): Promise<Topic | null> {
  try {
    // Try new structure first (folder-based with quiz.json)
    try {
      const quizData = await import(
        `../data/categories/${categoryId}/${subcategoryId}/${topicId}/quiz.json`
      );
      
      // New structure found - also look for lessons
      const lessons = await discoverLessons(categoryId, subcategoryId, topicId);
      
      const result = {
        id: quizData.id,
        name: quizData.name,
        description: quizData.description,
        category: quizData.category,
        subcategory: quizData.subcategory,
        levels: {
          easy: quizData.levels.easy,
          medium: quizData.levels.medium,
          hard: quizData.levels.hard,
        },
        ...(lessons && lessons.length > 0 && { lessons }),
      };
      
      return result;
    } catch (quizError) {
      // Quiz not found, try old file-based structure
      try {
        const topicData = await import(
          `../data/categories/${categoryId}/${subcategoryId}/${topicId}.json`
        );
        
        // Old structure found - still attempt to discover lessons for backward compatibility
        const lessons = await discoverLessons(categoryId, subcategoryId, topicId);
        
        const result = {
          id: topicData.id,
          name: topicData.name,
          description: topicData.description,
          category: topicData.category,
          subcategory: topicData.subcategory,
          levels: {
            easy: topicData.levels.easy,
            medium: topicData.levels.medium,
            hard: topicData.levels.hard,
          },
          ...(lessons && lessons.length > 0 && { lessons }),
        };
        
        return result;
      } catch (fileError) {
        // Neither quiz.json nor topicId.json found
        // Try to load as lessons-only topic
        const lessons = await discoverLessons(categoryId, subcategoryId, topicId);
        
        if (lessons && lessons.length > 0) {
          // Create a minimal topic object from the first lesson
          const firstLesson = lessons[0];
          return {
            id: topicId,
            name: firstLesson.title || topicId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            description: firstLesson.summary || `Learn ${topicId}`,
            category: categoryId,
            subcategory: subcategoryId,
            levels: {
              easy: { level: 'easy', description: '', questionCount: 0, questions: [] },
              medium: { level: 'medium', description: '', questionCount: 0, questions: [] },
              hard: { level: 'hard', description: '', questionCount: 0, questions: [] },
            },
            lessons,
          };
        }
        
        // No lessons or quiz found
        return null;
      }
    }
  } catch (error) {
    console.error(
      `Failed to load topic ${topicId} from ${categoryId}/${subcategoryId}:`,
      error
    );
    return null;
  }
}

/**
 * Get a specific level's questions from a topic
 * Randomizes options before returning
 */
export async function loadLevel(
  categoryId: string,
  subcategoryId: string,
  topicId: string,
  levelName: 'easy' | 'medium' | 'hard'
): Promise<Question[] | null> {
  const topic = await loadTopic(categoryId, subcategoryId, topicId);
  if (!topic) {
    return null;
  }
  const level = topic.levels[levelName];
  if (!level) {
    return null;
  }
  return randomizeQuestionOptions(level.questions);
}

/**
 * Helper to get all available topics across all subcategories of a category
 * Useful for sidebar navigation or search
 */
export async function getAllTopicsForCategory(
  categoryId: string
): Promise<
  Array<{
    subcategoryId: string;
    subcategoryName: string;
    topics: TopicInfo[];
  }>
> {
  const subcategories = await loadSubcategories(categoryId);
  const results: Array<{
    subcategoryId: string;
    subcategoryName: string;
    topics: TopicInfo[];
  }> = [];

  for (const subcategory of subcategories) {
    const topics = await loadTopics(categoryId, subcategory.id);
    results.push({
      subcategoryId: subcategory.id,
      subcategoryName: subcategory.name,
      topics,
    });
  }

  return results;
}

/**
 * Cache for lazy-loaded lesson content
 * Stores parsed markdown content to avoid re-parsing
 */
const lessonContentCache = new Map<string, MarkdownContent>();

/**
 * Generate cache key for lesson content
 */
function getLessonCacheKey(
  categoryId: string,
  subcategoryId: string,
  topicId: string,
  lessonId: string
): string {
  return `${categoryId}/${subcategoryId}/${topicId}/${lessonId}`;
}

/**
 * Discover all lessons in a topic folder
 * Uses fetch to read lesson files from dev server
 * Scans for lesson_*.md files, sorts by order, filters by active flag
 * Returns lessons with metadata only (content not loaded)
 */
export async function discoverLessons(
  categoryId: string,
  subcategoryId: string,
  topicId: string
): Promise<Lesson[]> {
  const lessons: Lesson[] = [];

  try {
    // Fetch each lesson file using HTTP fetch
    // Use import.meta.env.BASE_URL to get the base path (typically '/learn/')
    const basePath = import.meta.env.BASE_URL || '/learn/';
    
    let consecutiveMissing = 0;
    
    for (let i = 1; i <= 20; i++) {
      const lessonId = `lesson_${i}`;
      const lessonPath = `${basePath}data/categories/${categoryId}/${subcategoryId}/${topicId}/${lessonId}.md`;
      
      try {
        const response = await fetch(lessonPath);
        
        if (!response.ok) {
          consecutiveMissing++;
          // Stop after 3 consecutive missing files
          if (consecutiveMissing >= 3) {
            break;
          }
          continue;
        }
        
        consecutiveMissing = 0; // Reset counter when we find a file
        const content = await response.text();
        const markdownContent = parseFrontmatter(content);

        if (!markdownContent.metadata.active) {
          continue;
        }

        const lesson: Lesson = {
          id: lessonId,
          order: i,
          ...markdownContent.metadata,
        };

        lessons.push(lesson);
      } catch (e) {
        consecutiveMissing++;
        // Stop after 3 consecutive errors
        if (consecutiveMissing >= 3) {
          break;
        }
      }
    }
  } catch (error) {
    console.error(
      `Failed to discover lessons for ${categoryId}/${subcategoryId}/${topicId}:`,
      error
    );
  }

  const sorted = lessons.sort((a, b) => a.order - b.order);
  return sorted;
}

/**
 * Load a specific lesson's markdown content (lazy-loaded)
 * Parses frontmatter and returns both metadata and content
 * Results are cached in memory
 */
export async function loadLessonContent(
  categoryId: string,
  subcategoryId: string,
  topicId: string,
  lessonId: string
): Promise<MarkdownContent | null> {
  const cacheKey = getLessonCacheKey(
    categoryId,
    subcategoryId,
    topicId,
    lessonId
  );

  // Check cache first
  if (lessonContentCache.has(cacheKey)) {
    console.log(`[loadLessonContent] Returning cached content for ${lessonId}`);
    return lessonContentCache.get(cacheKey)!;
  }

  try {
    const basePath = import.meta.env.BASE_URL || '/learn/';
    const lessonPath = `${basePath}data/categories/${categoryId}/${subcategoryId}/${topicId}/${lessonId}.md`;
    console.log(`[loadLessonContent] Fetching from: ${lessonPath}`);
    
    const response = await fetch(lessonPath);
    
    if (!response.ok) {
      console.error(`[loadLessonContent] Failed to load lesson ${lessonId}: HTTP ${response.status}`);
      return null;
    }
    
    const content = await response.text();
    console.log(`[loadLessonContent] Fetched ${content.length} characters`);
    
    const markdownContent = parseFrontmatter(content);
    console.log(`[loadLessonContent] Parsed markdown, content length: ${markdownContent.content.length} chars`);

    // Cache the result
    lessonContentCache.set(cacheKey, markdownContent);

    return markdownContent;
  } catch (error) {
    console.error(
      `[loadLessonContent] Failed to load lesson content for ${categoryId}/${subcategoryId}/${topicId}/${lessonId}:`,
      error
    );
    return null;
  }
}

/**
 * Clear the lesson content cache
 * Useful for testing or when lessons need to be reloaded
 */
export function clearLessonContentCache(): void {
  lessonContentCache.clear();
}
