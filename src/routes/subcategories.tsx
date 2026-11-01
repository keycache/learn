import { useNavigate, useParams } from 'react-router-dom';
import { SubcategorySelector } from '@/components/navigation/SubcategorySelector';
import { useCategory } from '@/hooks/useCategory';

/**
 * Route component for subcategory selection
 * URL: /learn/:category
 * 
 * Navigates to: /learn/:category/:subcategory
 */
export function SubcategoriesRoute() {
  const navigate = useNavigate();
  const { category: categoryId } = useParams<{ category: string }>();
  const { category, loading } = useCategory();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground animate-pulse-gentle">Loading subcategories...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  return (
    <SubcategorySelector
      categoryId={categoryId || ''}
      categoryName={category.name}
      onSelectSubcategory={(subcategoryId) => {
        navigate(`/${categoryId}/${subcategoryId}`);
      }}
      onBack={() => {
        navigate(-1);
      }}
    />
  );
}
