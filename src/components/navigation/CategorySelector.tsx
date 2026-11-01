import { useState, useEffect } from 'react';
import { Category } from '../../types/learning';
import { loadCategories } from '../../utils/dataLoader';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { PageTransition } from '@/components/common/PageTransition';

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
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground animate-pulse-gentle">Loading categories...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground">No categories available</p>
      </div>
    );
  }

  return (
    <PageTransition animationType="slideUp">
      <div className="min-h-screen bg-themed p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Learning Platform
            </h1>
          <p className="text-lg text-muted-foreground">
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
              className="h-auto p-0 justify-start hover:border-blue-400 dark:hover:border-blue-600 overflow-hidden"
              asChild
            >
              <div className="w-full p-6 text-left flex flex-col">
                <div className="flex items-start justify-between mb-4 gap-2 flex-shrink-0">
                  <h2 className="text-xl font-bold text-foreground flex-1 line-clamp-2">
                    {category.name}
                  </h2>
                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" />
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {category.description}
                </p>

                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {category.subcategories.slice(0, 2).map((subcategory) => (
                      <Badge key={subcategory.id} variant="secondary" className="text-xs">
                        {subcategory.name}
                      </Badge>
                    ))}
                    {category.subcategories.length > 2 && (
                      <span className="text-xs text-muted-foreground px-2 py-1">
                        +{category.subcategories.length - 2} more
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
    </PageTransition>
  );
}
