import { useContext } from 'react';
import { QuizResultsContext } from '@/contexts/QuizResultsContext';

/**
 * Hook to access quiz results from context
 * Returns the results from the most recent quiz completion
 * Returns null if no results are available
 */
export function useQuizResults() {
  const context = useContext(QuizResultsContext);

  if (!context) {
    return null;
  }

  return context.results;
}
