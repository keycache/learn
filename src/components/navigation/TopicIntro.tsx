import { Topic } from '../../types/learning';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, BookOpen, BarChart3 } from 'lucide-react';

interface TopicIntroProps {
  categoryId: string;
  subcategoryId: string;
  topicId: string;
  topic: Topic;
  onStartQuiz: (level: 'easy' | 'medium' | 'hard') => void;
  onBack?: () => void;
}

export function TopicIntro({
  topic,
  onStartQuiz,
  onBack,
}: TopicIntroProps) {
  const levels = [
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-start gap-4">
          {onBack && (
            <Button onClick={onBack} variant="ghost" size="icon" className="flex-shrink-0 mt-1">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 capitalize mb-2">
              {topic.name || topic.id}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Choose your difficulty level to begin learning
            </p>
          </div>
        </div>

        {/* Topic Info Card */}
        <Card className="mb-12">
          <CardHeader>
            <div className="flex gap-4 mb-4">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <CardTitle>About This Topic</CardTitle>
                <CardDescription className="mt-2">
                  Master {topic.name || topic.id} through interactive quizzes. Each difficulty level contains 30 carefully selected questions to help you progress at your own pace.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">90</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Questions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Difficulty Levels</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">30</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Per Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {levels.map(({ level, title, description, color, icon }) => (
            <Button
              key={level}
              onClick={() => onStartQuiz(level)}
              variant="outline"
              className="h-auto p-0 justify-start"
              asChild
            >
              <Card className="w-full cursor-pointer relative overflow-hidden">
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`}
                />

                {/* Content */}
                <div className="relative z-10 p-6">
                  <div className="text-4xl mb-3">{icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {description}
                  </p>

                  {/* Start Button */}
                  <div className="text-blue-600 dark:text-blue-400 font-semibold">
                    Start →
                  </div>
                </div>

                {/* Level Indicator */}
                <Badge className="absolute top-3 right-3 capitalize">
                  {level}
                </Badge>
              </Card>
            </Button>
          ))}
        </div>

        {/* Tips Section */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <div className="flex gap-3">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <CardTitle className="text-blue-900 dark:text-blue-200">Learning Tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li>• Start with the Beginner level to build your foundation</li>
              <li>• Progress to Intermediate once you've achieved 70% on Beginner</li>
              <li>• Unlock Advanced once you've mastered Intermediate</li>
              <li>• Review wrong answers to improve your performance</li>
              <li>• Complete all levels to master this topic</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
