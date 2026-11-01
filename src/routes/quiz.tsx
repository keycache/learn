import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Quiz } from '@/components/learning/Quiz';
import { useTopic } from '@/hooks/useTopic';

/**
 * Route component for quiz
 * URL: /learn/:category/:subcategory/:topic/quiz?level=easy|medium|hard
 * 
 * Navigates to: /learn/:category/:subcategory/:topic/results
 */
export function QuizRoute() {
  const { category: categoryId, subcategory: subcategoryId, topic: topicId } = useParams<{
    category: string;
    subcategory: string;
    topic: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { topic, loading } = useTopic();

  const level = (searchParams.get('level') as 'easy' | 'medium' | 'hard') || 'easy';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground animate-pulse-gentle">Loading quiz...</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground">Quiz not found</p>
      </div>
    );
  }

  const questions = topic.levels[level]?.questions || [];

  return (
    <Quiz
      category={categoryId || ''}
      subcategory={subcategoryId || ''}
      topic={topicId || ''}
      level={level}
      questions={questions}
      onComplete={(results) => {
        navigate(`/${categoryId}/${subcategoryId}/${topicId}/results`);
      }}
    />
  );
}
