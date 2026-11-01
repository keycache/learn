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
 * Example: loadTopics('spoken-languages', 'french') -> returns [{id: 'numbers', name: 'Numbers'}, ...]
 */
export async function loadTopics(
  categoryId: string,
  subcategoryId: string
): Promise<TopicInfo[]> {
  try {
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
 * Example: loadTopic('spoken-languages', 'french', 'numbers')
 */
export async function loadTopic(
  categoryId: string,
  subcategoryId: string,
  topicId: string
): Promise<Topic | null> {
  try {
    const topicData = await import(
      `../data/categories/${categoryId}/${subcategoryId}/${topicId}.json`
    );
    return {
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
    };
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
    // Try to load all possible lesson files (lesson_1.md through lesson_20.md)
    // We use a fixed upper limit to avoid infinite loops
    // In practice, topics won't have more than 20 lessons
    for (let i = 1; i <= 20; i++) {
      const lessonId = `lesson_${i}`;
      try {
        const lessonContent = await import(
          `../data/categories/${categoryId}/${subcategoryId}/${topicId}/${lessonId}.md?raw`
        );

        // Parse frontmatter to get metadata
        const markdownContent = parseFrontmatter(lessonContent.default);

        // Skip inactive lessons
        if (!markdownContent.metadata.active) {
          continue;
        }

        // Create lesson object with metadata (content not loaded)
        const lesson: Lesson = {
          id: lessonId,
          order: i,
          ...markdownContent.metadata,
          // content and htmlContent omitted for lazy-loading
        };

        lessons.push(lesson);
      } catch {
        // Continue to next lesson if this one doesn't exist
        // Break if we've checked several non-existent files
        if (i > 5 && lessons.length === 0) {
          break; // No lessons found for this topic
        }
      }
    }
  } catch (error) {
    console.error(
      `Failed to discover lessons for ${categoryId}/${subcategoryId}/${topicId}:`,
      error
    );
  }

  // Sort by order (should already be in order, but ensure it)
  return lessons.sort((a, b) => a.order - b.order);
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
    return lessonContentCache.get(cacheKey)!;
  }

  try {
    const lessonContent = await import(
      `../data/categories/${categoryId}/${subcategoryId}/${topicId}/${lessonId}.md?raw`
    );

    const markdownContent = parseFrontmatter(lessonContent.default);

    // Cache the result
    lessonContentCache.set(cacheKey, markdownContent);

    return markdownContent;
  } catch (error) {
    console.error(
      `Failed to load lesson content for ${categoryId}/${subcategoryId}/${topicId}/${lessonId}:`,
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
