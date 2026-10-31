import { useState, useEffect } from 'react';
import { Subcategory } from '../../types/learning';
import { loadSubcategories } from '../../utils/dataLoader';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SubcategorySelectorProps {
  categoryId: string;
  categoryName: string;
  onSelectSubcategory: (subcategoryId: string) => void;
  onBack?: () => void;
}

export function SubcategorySelector({
  categoryId,
  categoryName,
  onSelectSubcategory,
  onBack,
}: SubcategorySelectorProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const subs = await loadSubcategories(categoryId);
      setSubcategories(subs);
      setLoading(false);
    };

    loadData();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600 dark:text-slate-400">Loading subcategories...</p>
      </div>
    );
  }

  if (subcategories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600 dark:text-slate-400">No subcategories available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            {onBack && (
              <Button onClick={onBack} variant="ghost" size="icon">
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
                {categoryName}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Select a subcategory to explore
              </p>
            </div>
          </div>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subcategories.map((subcategory) => (
            <Button
              key={subcategory.id}
              onClick={() => onSelectSubcategory(subcategory.id)}
              variant="outline"
              className="h-auto p-0 justify-start"
              asChild
            >
              <Card className="w-full cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{subcategory.name}</CardTitle>
                    <ChevronRight className="w-6 h-6 text-slate-400 dark:text-slate-600" />
                  </div>
                  <CardDescription>
                    {subcategory.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                {subcategory.topics && subcategory.topics.length > 0 && (
                  <div className="px-6 pb-4 text-xs text-slate-500 dark:text-slate-500">
                    {subcategory.topics.length} topic{subcategory.topics.length !== 1 ? 's' : ''} available
                  </div>
                )}
              </Card>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
