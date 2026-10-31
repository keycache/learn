import { Question, QuestionProgress } from '../../types/learning';
import { Check } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  selectedAnswers: string[];
  onSelectAnswer: (optionId: string, isMultipleChoice: boolean) => void;
  progress?: QuestionProgress;
}

export function QuestionCard({
  question,
  selectedAnswers,
  onSelectAnswer,
  progress,
}: QuestionCardProps) {
  const isMultipleChoice = question.correctAnswers.length > 1;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      {/* Question Text */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {question.text}
        </h2>
        {isMultipleChoice && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            (Select all that apply)
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option: any) => {
          const isSelected = selectedAnswers.includes(option.id);
          const isCorrect = question.correctAnswers.includes(option.id);

          return (
            <label
              key={option.id}
              className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {isMultipleChoice ? (
                /* Checkbox for multiple choice */
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelectAnswer(option.id, true)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 cursor-pointer accent-blue-600 dark:accent-blue-500"
                />
              ) : (
                /* Radio button for single choice */
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={isSelected}
                  onChange={() => onSelectAnswer(option.id, false)}
                  className="mt-1 w-5 h-5 cursor-pointer accent-blue-600 dark:accent-blue-500"
                />
              )}
              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                {option.text}
              </span>
              {isSelected && (
                <Check className="w-5 h-5 text-green-600 dark:text-green-500 ml-auto" />
              )}
            </label>
          );
        })}
      </div>

      {/* Progress Info */}
      {progress && (
        <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">
          Attempts: {progress.attempts} | Correct: {progress.attempts - progress.wrong}
        </div>
      )}
    </div>
  );
}
