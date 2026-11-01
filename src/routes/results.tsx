import { useParams, useNavigate } from 'react-router-dom';
import { ResultsScreen } from '@/components/learning/ResultsScreen';
import { useQuizResults } from '@/hooks/useQuizResults';
import { useTopic } from '@/hooks/useTopic';

/**
 * Route component for quiz results
 * URL: /learn/:category/:subcategory/:topic/results
 * 
 * Navigates back to: /learn/:category/:subcategory/:topic (for retry)
 */
export function ResultsRoute() {
  const { category: categoryId, subcategory: subcategoryId, topic: topicId } = useParams<{
    category: string;
    subcategory: string;
    topic: string;
  }>();
  const navigate = useNavigate();
  const results = useQuizResults();
  const { topic, loading } = useTopic();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground animate-pulse-gentle">Loading results...</p>
      </div>
    );
  }

  if (!results || !topic) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground">Results not found. Please take the quiz again.</p>
      </div>
    );
  }

  return (
    <ResultsScreen
      category={categoryId || ''}
      subcategory={subcategoryId || ''}
      topic={topicId || ''}
      level={results.level}
      score={results.score}
      total={results.total}
      wrongQuestionIds={results.wrongQuestionIds}
      allQuestions={results.allQuestions}
      onRetry={() => {
        navigate(`/${categoryId}/${subcategoryId}/${topicId}/quiz?level=${results.level}`);
      }}
      onBack={() => {
        navigate(`/${categoryId}/${subcategoryId}/${topicId}`);
      }}
    />
  );
}
