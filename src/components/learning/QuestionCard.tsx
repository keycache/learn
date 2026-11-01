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
    <>
      {/* Question Text */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          {question.text}
        </h2>
        {isMultipleChoice && (
          <p className="mt-2 text-sm text-muted-foreground">
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
              className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted"
            >
              {isMultipleChoice ? (
                /* Checkbox for multiple choice */
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelectAnswer(option.id, true)}
                  className="mt-1 w-5 h-5 rounded border-input text-blue-600 dark:text-blue-500 cursor-pointer accent-blue-600 dark:accent-blue-500"
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
              <span className="text-sm font-medium text-card-foreground">
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
        <div className="text-xs text-muted-foreground border-t border-border pt-3">
          Attempts: {progress.attempts} | Correct: {progress.attempts - progress.wrong}
        </div>
      )}
    </>
  );
}
