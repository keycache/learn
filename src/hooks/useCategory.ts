import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Category } from '@/types/learning';
import { loadCategories } from '@/utils/dataLoader';

/**
 * Custom hook to load and validate category from URL params
 * Handles loading state, validation, and flags notFound on invalid category
 */
export function useCategory() {
  const { category: categoryId } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId) {
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

      setCategory(foundCategory);
      setNotFound(false);
      setLoading(false);
    };

    loadData();
  }, [categoryId, navigate]);

  return { category, loading, notFound };
}
