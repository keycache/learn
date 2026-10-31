import { Question } from '../../types/learning';
import { Check, X, RotateCcw } from 'lucide-react';

interface ResultsScreenProps {
  category: string;
  subcategory: string;
  topic: string;
  level: 'easy' | 'medium' | 'hard';
  score: number;
  total: number;
  wrongQuestionIds: string[];
  allQuestions: Question[];
  onRetry?: () => void;
  onBack?: () => void;
}

export function ResultsScreen({
  category,
  subcategory,
  topic,
  level,
  score,
  total,
  wrongQuestionIds,
  allQuestions,
  onRetry,
  onBack,
}: ResultsScreenProps) {
  const percentage = (score / total) * 100;
  const wrongCount = total - score;

  const getPerformanceLevel = () => {
    if (percentage >= 90) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400' };
    if (percentage >= 75) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400' };
    if (percentage >= 60) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
    return { label: 'Needs Practice', color: 'text-red-600 dark:text-red-400' };
  };

  const performance = getPerformanceLevel();
  const wrongQuestions = allQuestions.filter((q) => wrongQuestionIds.includes(q.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            {topic.charAt(0).toUpperCase() + topic.slice(1)} - {level.charAt(0).toUpperCase() + level.slice(1)}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Quiz Complete!</p>
        </div>

        {/* Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-8 mb-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900 border-4 border-blue-200 dark:border-blue-800 mb-4">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(percentage)}%
              </div>
            </div>

            <p className={`text-2xl font-semibold mb-2 ${performance.color}`}>
              {performance.label}
            </p>

            <p className="text-lg text-slate-600 dark:text-slate-400">
              {score} out of {total} correct
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{score}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Correct</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{wrongCount}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Incorrect</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-600 dark:text-slate-400">{total}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
            </div>
          </div>
        </div>

        {/* Wrong Questions */}
        {wrongQuestions.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              Questions to Review ({wrongQuestions.length})
            </h2>

            <div className="space-y-3">
              {wrongQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                    {question.text}
                  </p>
                  {question.explanation && (
                    <p className="text-xs text-red-700 dark:text-red-300">
                      💡 <span className="font-medium">Explanation:</span> {question.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Back to Topics
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
