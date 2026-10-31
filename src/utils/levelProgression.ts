import { getLevelProgress } from './progressTracker';

const LEVEL_COMPLETION_THRESHOLD = 70; // 70% to pass a level

export function isLevelPassed(
  category: string,
  subcategory: string,
  topic: string,
  level: 'easy' | 'medium' | 'hard'
): boolean {
  const progress = getLevelProgress(category, subcategory, topic, level);
  if (progress.totalQuestions === 0) return false;

  const passPercentage = (progress.correctCount / progress.totalQuestions) * 100;
  return passPercentage >= LEVEL_COMPLETION_THRESHOLD;
}

export function canAccessLevel(
  category: string,
  subcategory: string,
  topic: string,
  level: 'easy' | 'medium' | 'hard'
): boolean {
  // Easy level is always accessible
  if (level === 'easy') return true;

  // Medium requires Easy to be passed
  if (level === 'medium') {
    return isLevelPassed(category, subcategory, topic, 'easy');
  }

  // Hard requires Medium to be passed
  if (level === 'hard') {
    return isLevelPassed(category, subcategory, topic, 'medium');
  }

  return false;
}

export function getNextAvailableLevel(
  category: string,
  subcategory: string,
  topic: string
): 'easy' | 'medium' | 'hard' | null {
  if (canAccessLevel(category, subcategory, topic, 'hard') &&
      !isLevelPassed(category, subcategory, topic, 'hard')) {
    return 'hard';
  }

  if (canAccessLevel(category, subcategory, topic, 'medium') &&
      !isLevelPassed(category, subcategory, topic, 'medium')) {
    return 'medium';
  }

  if (!isLevelPassed(category, subcategory, topic, 'easy')) {
    return 'easy';
  }

  return null; // All levels completed
}

export function getLevelStatus(
  category: string,
  subcategory: string,
  topic: string,
  level: 'easy' | 'medium' | 'hard'
): 'locked' | 'available' | 'completed' {
  if (!canAccessLevel(category, subcategory, topic, level)) {
    return 'locked';
  }

  if (isLevelPassed(category, subcategory, topic, level)) {
    return 'completed';
  }

  return 'available';
}

export function getDetailedLevelProgress(
  category: string,
  subcategory: string,
  topic: string,
  level: 'easy' | 'medium' | 'hard'
): { correctCount: number; totalQuestions: number; percentage: number } {
  const progress = getLevelProgress(category, subcategory, topic, level);
  const percentage = progress.totalQuestions > 0 
    ? (progress.correctCount / progress.totalQuestions) * 100 
    : 0;

  return {
    correctCount: progress.correctCount,
    totalQuestions: progress.totalQuestions,
    percentage,
  };
}
