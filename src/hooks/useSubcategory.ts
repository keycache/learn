import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Subcategory } from '@/types/learning';
import { loadCategories } from '@/utils/dataLoader';

/**
 * Custom hook to load and validate subcategory from URL params
 * Handles loading state, validation, and redirect to 404 on invalid subcategory
 */
export function useSubcategory() {
  const { category: categoryId, subcategory: subcategoryId } = useParams<{
    category: string;
    subcategory: string;
  }>();
  const navigate = useNavigate();
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId || !subcategoryId) {
        navigate('/');
        return;
      }

      const categoriesMap = await loadCategories();
      const foundCategory = categoriesMap[categoryId];

      if (!foundCategory) {
        navigate('/not-found');
        return;
      }

      const foundSubcategory = foundCategory.subcategories?.find(
        (s) => s.id === subcategoryId
      );

      if (!foundSubcategory) {
        navigate('/not-found');
        return;
      }

      setSubcategory(foundSubcategory);
      setCategoryName(foundCategory.name);
      setLoading(false);
    };

    loadData();
  }, [categoryId, subcategoryId, navigate]);

  return { subcategory, categoryName, loading };
}
