import { QuestionProgress } from '../types/learning';

/**
 * Generate a localStorage key for a specific question
 * Format: "category.subcategory.topic.level.questionId"
 */
function getProgressKey(
  categoryId: string,
  subcategoryId: string,
  topicId: string,
  level: 'easy' | 'medium' | 'hard',
  questionId: string
): string {
  return `progress.${categoryId}.${subcategoryId}.${topicId}.${level}.${questionId}`;
}

/**
 * Get progress for a specific question
 */
export function getQuestionProgress(
  categoryId: string,
  subcategoryId: string,
  topicId: string,
  level: 'easy' | 'medium' | 'hard',
  questionId: string
): QuestionProgress {
  const key = getProgressKey(categoryId, subcategoryId, topicId, level, questionId);
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored) as QuestionProgress;
    } catch (error) {
      console.error(`Failed to parse progress for ${key}:`, error);
      return { attempts: 0, wrong: 0 };
    }
  }

  return { attempts: 0, wrong: 0 };
}

/**
 * Update progress for a specific question
 */
export function updateQuestionProgress(
  categoryId: string,
  subcategoryId: string,
  topicId: string,
  level: 'easy' | 'medium' | 'hard',
  questionId: string,
  isCorrect: boolean
): QuestionProgress {
  const key = getProgressKey(categoryId, subcategoryId, topicId, level, questionId);
  const current = getQuestionProgress(categoryId, subcategoryId, topicId, level, questionId);

  const updated: QuestionProgress = {
    attempts: current.attempts + 1,
    wrong: isCorrect ? current.wrong : current.wrong + 1,
  };

  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

/**
 * Get all progress for a specific topic (all levels combined)
 */
export function getTopicProgress(
  categoryId: string,
  subcategoryId: string,
  topicId: string
): { level: 'easy' | 'medium' | 'hard'; questions: Record<string, QuestionProgress> } | null {
  // This would need to be called after loading the topic to get question IDs
  // For now, we return null as a placeholder
  return null;
}

/**
 * Get progress for a specific level
 */
export function getLevelProgress(
  categoryId: string,
  subcategoryId: string,
  topicId: string,
  level: 'easy' | 'medium' | 'hard'
): { correctCount: number; totalQuestions: number; successRate: number } {
  const keys = getAllStorageKeys();
  const levelPrefix = `progress.${categoryId}.${subcategoryId}.${topicId}.${level}.`;
  const levelKeys = keys.filter((key) => key.startsWith(levelPrefix));

  let correctCount = 0;
  let totalAttempts = 0;

  levelKeys.forEach((key) => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const progress = JSON.parse(stored) as QuestionProgress;
        const correct = progress.attempts - progress.wrong;
        if (correct > 0) {
          correctCount++;
        }
        totalAttempts += progress.attempts;
      } catch (error) {
        console.error(`Failed to parse progress for ${key}:`, error);
      }
    }
  });

  return {
    correctCount,
    totalQuestions: levelKeys.length,
    successRate: levelKeys.length > 0 ? (correctCount / levelKeys.length) * 100 : 0,
  };
}

/**
 * Check if a level is completed (all questions answered correctly at least once)
 */
export function isLevelCompleted(
  categoryId: string,
  subcategoryId: string,
  topicId: string,
  level: 'easy' | 'medium' | 'hard'
): boolean {
  const progress = getLevelProgress(categoryId, subcategoryId, topicId, level);
  return progress.totalQuestions > 0 && progress.correctCount === progress.totalQuestions;
}

/**
 * Clear all progress (for testing or reset)
 */
export function clearAllProgress(): void {
  const keys = getAllStorageKeys();
  const progressKeys = keys.filter((key) => key.startsWith('progress.'));
  progressKeys.forEach((key) => localStorage.removeItem(key));
}

/**
 * Clear progress for a specific topic
 */
export function clearTopicProgress(
  categoryId: string,
  subcategoryId: string,
  topicId: string
): void {
  const keys = getAllStorageKeys();
  const topicPrefix = `progress.${categoryId}.${subcategoryId}.${topicId}.`;
  const topicKeys = keys.filter((key) => key.startsWith(topicPrefix));
  topicKeys.forEach((key) => localStorage.removeItem(key));
}

/**
 * Get all storage keys (helper function)
 */
function getAllStorageKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Get comprehensive progress stats for a category
 */
export function getCategoryStats(categoryId: string): {
  totalQuestionsAttempted: number;
  correctAnswers: number;
  overallSuccessRate: number;
} {
  const keys = getAllStorageKeys();
  const categoryPrefix = `progress.${categoryId}.`;
  const categoryKeys = keys.filter((key) => key.startsWith(categoryPrefix));

  let totalAttempts = 0;
  let correctCount = 0;

  categoryKeys.forEach((key) => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const progress = JSON.parse(stored) as QuestionProgress;
        const correct = progress.attempts - progress.wrong;
        if (correct > 0) {
          correctCount++;
        }
        totalAttempts += progress.attempts;
      } catch (error) {
        console.error(`Failed to parse progress for ${key}:`, error);
      }
    }
  });

  return {
    totalQuestionsAttempted: totalAttempts,
    correctAnswers: correctCount,
    overallSuccessRate: totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0,
  };
}
