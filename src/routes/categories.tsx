import { useNavigate } from 'react-router-dom';
import { CategorySelector } from '@/components/navigation/CategorySelector';

/**
 * Route component for category selection (root route)
 * URL: /learn/
 * 
 * Navigates to: /learn/:category
 */
export function CategoriesRoute() {
  const navigate = useNavigate();

  return (
    <CategorySelector
      onSelectCategory={(categoryId, categoryName) => {
        navigate(`/${categoryId}`);
      }}
    />
  );
}
