import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Topic } from '@/types/learning';
import { loadTopic } from '@/utils/dataLoader';

/**
 * Custom hook to load and validate topic from URL params
 * Handles loading state, validation, and flags notFound on invalid topic
 */
export function useTopic() {
  const { category: categoryId, subcategory: subcategoryId, topic: topicId } = useParams<{
    category: string;
    subcategory: string;
    topic: string;
  }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId || !subcategoryId || !topicId) {
        navigate('/');
        return;
      }

      const foundTopic = await loadTopic(categoryId, subcategoryId, topicId);

      if (!foundTopic) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTopic(foundTopic);
      setNotFound(false);
      setLoading(false);
    };

    loadData();
  }, [categoryId, subcategoryId, topicId, navigate]);

  return { topic, loading, notFound };
}
