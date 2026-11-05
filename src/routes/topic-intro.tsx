import { useParams, useNavigate } from 'react-router-dom';
import { TopicIntro } from '@/components/navigation/TopicIntro';
import { useTopic } from '@/hooks/useTopic';
import { NotFoundRoute } from './not-found';

/**
 * Route component for topic intro with lessons and quiz selector
 * URL: /learn/:category/:subcategory/:topic
 * 
 * Navigates to: /learn/:category/:subcategory/:topic/quiz?level=easy|medium|hard
 */
export function TopicIntroRoute() {
  const { category: categoryId, subcategory: subcategoryId, topic: topicId } = useParams<{
    category: string;
    subcategory: string;
    topic: string;
  }>();
  const navigate = useNavigate();
  const { topic, loading, notFound } = useTopic();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground animate-pulse-gentle">Loading topic...</p>
      </div>
    );
  }

  if (notFound || !topic) {
    return <NotFoundRoute />;
  }

  return (
    <TopicIntro
      categoryId={categoryId || ''}
      subcategoryId={subcategoryId || ''}
      topicId={topicId || ''}
      topic={topic}
      onStartQuiz={(level) => {
        navigate(`/${categoryId}/${subcategoryId}/${topicId}/quiz?level=${level}`);
      }}
    />
  );
}
