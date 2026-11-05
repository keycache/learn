import { Question } from '../types/learning';

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Randomize question order and shuffle options within each question
 */
export function randomizeQuiz(questions: Question[]): Question[] {
  // First shuffle the questions
  const shuffledQuestions = shuffleArray(questions);

  // Then shuffle options within each question
  return shuffledQuestions.map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }));
}
