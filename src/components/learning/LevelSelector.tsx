import { Lock, CheckCircle, PlayCircle } from 'lucide-react';
import { getLevelStatus, getDetailedLevelProgress } from '../../utils/levelProgression';

interface LevelSelectorProps {
  category: string;
  subcategory: string;
  topic: string;
  onSelectLevel: (level: 'easy' | 'medium' | 'hard') => void;
}

export function LevelSelector({
  category,
  subcategory,
  topic,
  onSelectLevel,
}: LevelSelectorProps) {
  const levels = ['easy', 'medium', 'hard'] as const;

  const renderLevelCard = (level: 'easy' | 'medium' | 'hard') => {
    const status = getLevelStatus(category, subcategory, topic, level);
    const progress = getDetailedLevelProgress(category, subcategory, topic, level);

    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';

    return (
      <button
        key={level}
        onClick={() => !isLocked && onSelectLevel(level)}
        disabled={isLocked}
        className={`p-6 rounded-lg border-2 transition-all ${
          isLocked
            ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-50'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 capitalize">
            {level}
          </h3>
          {isLocked ? (
            <Lock className="w-5 h-5 text-slate-400 dark:text-slate-600" />
          ) : isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
        </div>

        {/* Status */}
        <p className="text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
          {isLocked && 'Locked'}
          {!isLocked && isCompleted && 'Completed'}
          {!isLocked && !isCompleted && 'Available'}
        </p>

        {/* Progress */}
        {!isLocked && progress.totalQuestions > 0 && (
          <>
            <div className="mb-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {progress.correctCount} / {progress.totalQuestions} correct
            </p>
          </>
        )}

        {!isLocked && progress.totalQuestions === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-500 italic">Not started</p>
        )}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      {levels.map((level) => renderLevelCard(level))}
    </div>
  );
}
