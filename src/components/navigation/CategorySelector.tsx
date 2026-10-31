import { useState, useEffect } from 'react';
import { Category } from '../../types/learning';
import { loadCategories } from '../../utils/dataLoader';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface CategorySelectorProps {
  onSelectCategory: (categoryId: string, categoryName: string) => void;
}

export function CategorySelector({ onSelectCategory }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const categoriesMap = await loadCategories();
      setCategories(Object.values(categoriesMap));
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600 dark:text-slate-400">Loading categories...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600 dark:text-slate-400">No categories available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            Learning Platform
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Choose a learning category to get started
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => onSelectCategory(category.id, category.name)}
              variant="outline"
              className="h-auto p-0 justify-start hover:border-blue-400 dark:hover:border-blue-600"
              asChild
            >
              <div className="w-full p-6 text-left">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    {category.name}
                  </h2>
                  <ChevronRight className="w-6 h-6 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {category.description}
                </p>

                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.slice(0, 3).map((subcategory) => (
                      <Badge key={subcategory.id} variant="secondary">
                        {subcategory.name}
                      </Badge>
                    ))}
                    {category.subcategories.length > 3 && (
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        +{category.subcategories.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
