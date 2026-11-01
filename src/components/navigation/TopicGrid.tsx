import { useState, useEffect } from 'react';
import { TopicInfo } from '../../types/learning';
import { loadTopics } from '../../utils/dataLoader';
import { getLevelStatus, getDetailedLevelProgress } from '../../utils/levelProgression';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Lock, CheckCircle, PlayCircle } from 'lucide-react';
import { PageTransition } from '@/components/common/PageTransition';

interface TopicGridProps {
  categoryId: string;
  subcategoryId: string;
  categoryName: string;
  subcategoryName: string;
  onSelectTopic: (topicId: string) => void;
  onBack?: () => void;
}

export function TopicGrid({
  categoryId,
  subcategoryId,
  categoryName,
  subcategoryName,
  onSelectTopic,
  onBack,
}: TopicGridProps) {
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const loadedTopics = await loadTopics(categoryId, subcategoryId);
      setTopics(loadedTopics);
      setLoading(false);
    };

    loadData();
  }, [categoryId, subcategoryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground animate-pulse-gentle">Loading topics...</p>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <p className="text-muted-foreground">No topics available</p>
      </div>
    );
  }

  return (
    <PageTransition animationType="slideUp">
    <div className="min-h-screen bg-themed p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Breadcrumb */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            {onBack && (
              <Button onClick={onBack} variant="ghost" size="icon">
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                {categoryName} › {subcategoryName}
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Topics
              </h1>
              <p className="text-muted-foreground mt-1">
                Choose a topic to start learning
              </p>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              categoryId={categoryId}
              subcategoryId={subcategoryId}
              onSelect={() => onSelectTopic(topic.id)}
            />
          ))}
        </div>
      </div>
      </div>
    </PageTransition>
  );
}

interface TopicCardProps {
  topic: TopicInfo;
  categoryId: string;
  subcategoryId: string;
  onSelect: () => void;
}

function TopicCard({ topic, categoryId, subcategoryId, onSelect }: TopicCardProps) {
  const easyStatus = getLevelStatus(categoryId, subcategoryId, topic.id, 'easy');
  const mediumStatus = getLevelStatus(categoryId, subcategoryId, topic.id, 'medium');
  const hardStatus = getLevelStatus(categoryId, subcategoryId, topic.id, 'hard');

  const easyProgress = getDetailedLevelProgress(categoryId, subcategoryId, topic.id, 'easy');
  const mediumProgress = getDetailedLevelProgress(categoryId, subcategoryId, topic.id, 'medium');
  const hardProgress = getDetailedLevelProgress(categoryId, subcategoryId, topic.id, 'hard');

  const allLevelsCompleted =
    easyStatus === 'completed' && mediumStatus === 'completed' && hardStatus === 'completed';

  const renderLevelBadge = (
    status: 'locked' | 'available' | 'completed',
    progress: { correctCount: number; totalQuestions: number; percentage: number }
  ) => {
    if (status === 'locked') {
      return <Lock className="w-4 h-4 text-muted-foreground" />;
    }
    if (status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
    }
    if (progress.totalQuestions > 0) {
      return (
        <div className="w-full bg-muted rounded h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-full"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      );
    }
    return <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <Button
      onClick={onSelect}
      variant="outline"
      className="h-auto p-0 justify-start"
      asChild
    >
      <Card className="w-full cursor-pointer">
        <CardHeader>
          <CardTitle className="capitalize text-lg">
            {topic.name || topic.id}
          </CardTitle>

          {/* Levels */}
          <div className="space-y-2 mt-4">
            {[
              { level: 'Easy', status: easyStatus, progress: easyProgress },
              { level: 'Medium', status: mediumStatus, progress: mediumProgress },
              { level: 'Hard', status: hardStatus, progress: hardProgress },
            ].map(({ level, status, progress }) => (
              <div key={level} className="flex items-center gap-2 text-xs">
                <span className="w-14 text-muted-foreground">{level}</span>
                <div className="flex-1">{renderLevelBadge(status, progress)}</div>
                {status === 'completed' && (
                  <span className="text-green-600 dark:text-green-400 font-medium">✓</span>
                )}
              </div>
            ))}
          </div>

          {/* Completion Badge */}
          {allLevelsCompleted && (
            <Badge className="mt-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              All levels completed! 🎉
            </Badge>
          )}
        </CardHeader>
      </Card>
    </Button>
  );
}
