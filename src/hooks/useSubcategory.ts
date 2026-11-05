import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Subcategory } from '@/types/learning';
import { loadCategories } from '@/utils/dataLoader';

/**
 * Custom hook to load and validate subcategory from URL params
 * Handles loading state, validation, and flags notFound on invalid subcategory
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
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId || !subcategoryId) {
        navigate('/');
        return;
      }

      const categoriesMap = await loadCategories();
      const foundCategory = categoriesMap[categoryId];

      if (!foundCategory) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const foundSubcategory = foundCategory.subcategories?.find(
        (s) => s.id === subcategoryId
      );

      if (!foundSubcategory) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setSubcategory(foundSubcategory);
      setNotFound(false);
      setCategoryName(foundCategory.name);
      setLoading(false);
    };

    loadData();
  }, [categoryId, subcategoryId, navigate]);

  return { subcategory, categoryName, loading, notFound };
}
