import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Topic } from '../../types/learning';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, BookOpen, BarChart3 } from 'lucide-react';
import { PageTransition } from '@/components/common/PageTransition';
import { LessonTabs } from '@/components/learning/LessonTabs';

interface TopicIntroProps {
  categoryId: string;
  subcategoryId: string;
  topicId: string;
  topic: Topic;
  onStartQuiz: (level: 'easy' | 'medium' | 'hard') => void;
  onBack?: () => void;
}

const DIFFICULTY_LEVELS = [
  {
    level: 'easy' as const,
    title: 'Beginner',
    description: 'Perfect for getting started with the basics',
    color: 'from-green-500 to-emerald-600',
    icon: '🌱',
  },
  {
    level: 'medium' as const,
    title: 'Intermediate',
    description: 'Build on your knowledge and challenge yourself',
    color: 'from-blue-500 to-cyan-600',
    icon: '🚀',
  },
  {
    level: 'hard' as const,
    title: 'Advanced',
    description: 'Master the topic with challenging questions',
    color: 'from-purple-500 to-pink-600',
    icon: '⭐',
  },
];

export function TopicIntro({
  categoryId,
  subcategoryId,
  topicId,
  topic,
  onStartQuiz,
  onBack,
}: TopicIntroProps) {
  const [viewedLessons, setViewedLessons] = useState<Set<string>>(new Set());

  // Check if topic has lessons
  const hasLessons = useMemo(() => {
    return topic.lessons && topic.lessons.length > 0;
  }, [topic.lessons]);

  // Render quiz content for LessonTabs
  const renderQuizContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Quiz</h3>
        <p className="text-muted-foreground mb-6">
          After completing the lessons, test your knowledge with our interactive quiz. Choose a difficulty level to get started.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DIFFICULTY_LEVELS.map(({ level, title, description }) => (
            <div
              key={level}
              onClick={() => onStartQuiz(level)}
              className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 hover:border-foreground/30 transition-colors"
            >
              <h4 className="font-semibold text-foreground mb-2">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // If topic has lessons, show LessonTabs instead of level selector
  if (hasLessons && topic.lessons) {
    return (
      <PageTransition animationType="slideUp">
        <div className="min-h-screen bg-themed p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header with Back Button and Breadcrumb */}
            <div className="mb-8 flex items-start gap-4">
              {onBack && (
                <Button onClick={onBack} variant="ghost" size="icon" className="flex-shrink-0 mt-1">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-3">
                  <Link 
                    to="/" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {topic.category?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Link>
                  {' › '}
                  <Link 
                    to={`/${topic.category}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {topic.subcategory?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Link>
                  {' › '}
                  <Link 
                    to={`/${topic.category}/${topic.subcategory}/${topic.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {topic.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Link>
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {topic.name || topic.id}
                </h1>
                <p className="text-lg text-muted-foreground">
                  Learn and master this topic through lessons and practice quizzes
                </p>
              </div>
            </div>

            {/* Topic Info Card */}
            <div className="mb-8">
              <div className="flex gap-4 mb-4">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">About This Topic</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete {topic.lessons.length} lesson{topic.lessons.length !== 1 ? 's' : ''} and then test your knowledge with our interactive quizzes.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {topic.lessons.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</div>
                  <p className="text-sm text-muted-foreground">Quiz Levels</p>
                </div>
              </div>
            </div>

            {/* Lessons Tabs */}
            <LessonTabs
              lessons={topic.lessons}
              categoryId={categoryId}
              subcategoryId={subcategoryId}
              topicId={topicId}
              viewedLessons={viewedLessons}
              onLessonLoad={(lessonId, _content) => {
                // Track viewed lessons when content is loaded
                setViewedLessons(prev => new Set([...prev, lessonId]));
              }}
              showQuizTab={
                topic.levels?.easy?.questions?.length > 0 ||
                topic.levels?.medium?.questions?.length > 0 ||
                topic.levels?.hard?.questions?.length > 0
              }
              renderQuizContent={renderQuizContent}
            />

            {/* Learning Tips */}
            <div className="mt-8">
              <div className="flex gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <h2 className="text-lg font-semibold text-foreground">Learning Tips</h2>
              </div>
              <ul className="space-y-2 text-sm text-foreground">
                <li>• Start with the first lesson to build your foundation</li>
                <li>• You can skip lessons and come back to them later</li>
                <li>• Complete lessons before taking the quiz for best results</li>
                <li>• Review the quiz answers to improve your performance</li>
                <li>• Try different difficulty levels to challenge yourself</li>
              </ul>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Original behavior: Show level selector if no lessons
  return (
    <PageTransition animationType="slideUp">
      <div className="min-h-screen bg-themed p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8 flex items-start gap-4">
            {onBack && (
              <Button onClick={onBack} variant="ghost" size="icon" className="flex-shrink-0 mt-1">
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-3">
                <Link 
                  to="/" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {topic.category?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Link>
                {' › '}
                <Link 
                  to={`/${topic.category}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {topic.subcategory?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Link>
                {' › '}
                <Link 
                  to={`/${topic.category}/${topic.subcategory}/${topic.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {topic.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Link>
              </div>
              <h1 className="text-4xl font-bold text-foreground capitalize mb-2">
                {topic.name || topic.id}
              </h1>
              <p className="text-lg text-muted-foreground">
                Choose your difficulty level to begin learning
              </p>
            </div>
          </div>

          {/* Topic Info Card */}
          <div className="mb-12">
            <div className="flex gap-4 mb-4">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">About This Topic</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Master {topic.name || topic.id} through interactive quizzes. Each difficulty level contains 30 carefully selected questions to help you progress at your own pace.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">90</div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</div>
                <p className="text-sm text-muted-foreground">Difficulty Levels</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">30</div>
                <p className="text-sm text-muted-foreground">Per Level</p>
              </div>
            </div>
          </div>

          {/* Difficulty Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {DIFFICULTY_LEVELS.map(({ level, title, description }) => (
              <div
                key={level}
                onClick={() => onStartQuiz(level)}
                className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 hover:border-foreground/30 transition-colors"
              >
                <h4 className="font-semibold text-foreground mb-2">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div>
            <div className="flex gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <h2 className="text-lg font-semibold text-foreground">Learning Tips</h2>
            </div>
            <ul className="space-y-2 text-sm text-foreground">
              <li>• Start with the Beginner level to build your foundation</li>
              <li>• Progress to Intermediate once you've achieved 70% on Beginner</li>
              <li>• Unlock Advanced once you've mastered Intermediate</li>
              <li>• Review wrong answers to improve your performance</li>
              <li>• Complete all levels to master this topic</li>
            </ul>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
