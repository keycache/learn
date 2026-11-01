import { useParams, useNavigate } from 'react-router-dom';
import { TopicGrid } from '@/components/navigation/TopicGrid';
import { useSubcategory } from '@/hooks/useSubcategory';

/**
 * Route component for topic selection
 * URL: /learn/:category/:subcategory
 * 
 * Navigates to: /learn/:category/:subcategory/:topic
 */
export function TopicsRoute() {
  const { category: categoryId, subcategory: subcategoryId } = useParams<{
    category: string;
    subcategory: string;
  }>();
  const navigate = useNavigate();
  const { subcategory, categoryName, loading } = useSubcategory();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground animate-pulse-gentle">Loading topics...</p>
      </div>
    );
  }

  if (!subcategory || !categoryName) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground">Category or subcategory not found</p>
      </div>
    );
  }

  return (
    <TopicGrid
      categoryId={categoryId || ''}
      subcategoryId={subcategoryId || ''}
      categoryName={categoryName}
      subcategoryName={subcategory.name}
      onSelectTopic={(topicId) => {
        navigate(`/${categoryId}/${subcategoryId}/${topicId}`);
      }}
    />
  );
}
