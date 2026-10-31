import {
  Category,
  Subcategory,
  Topic,
  Level,
  Question,
  TopicInfo,
} from '../types/learning';

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
