import { useState, useEffect, useContext } from 'react';
import { Question } from '../../types/learning';
import { QuestionCard } from './QuestionCard';
import { updateQuestionProgress, getQuestionProgress } from '../../utils/progressTracker';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { QuizResultsContext } from '@/contexts/QuizResultsContext';

interface QuizProps {
  category: string;
  subcategory: string;
  topic: string;
  level: 'easy' | 'medium' | 'hard';
  questions: Question[];
  onComplete?: (results: QuizResults) => void;
  onBack?: () => void;
}

interface QuizResults {
  score: number;
  total: number;
  percentage: number;
  wrongQuestions: string[];
}

export function Quiz({
  category,
  subcategory,
  topic,
  level,
  questions,
  onComplete,
  onBack,
}: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string[]>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const quizResultsContext = useContext(QuizResultsContext);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  // Get existing progress for this question
  const questionProgress = getQuestionProgress(category, subcategory, topic, level, currentQuestion.id);

  const handleSelectAnswer = (optionId: string, isMultipleChoice: boolean) => {
    const newAnswers = new Map(userAnswers);
    const currentAnswers = newAnswers.get(currentQuestion.id) || [];

    if (isMultipleChoice) {
      // Toggle for checkbox
      if (currentAnswers.includes(optionId)) {
        newAnswers.set(
          currentQuestion.id,
          currentAnswers.filter((id) => id !== optionId)
        );
      } else {
        newAnswers.set(currentQuestion.id, [...currentAnswers, optionId]);
      }
    } else {
      // Replace for radio button
      newAnswers.set(currentQuestion.id, [optionId]);
    }

    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitQuestion = () => {
    const userAnswer = userAnswers.get(currentQuestion.id) || [];
    const isCorrect =
      userAnswer.length === currentQuestion.correctAnswers.length &&
      userAnswer.every((id: string) => currentQuestion.correctAnswers.includes(id)) &&
      currentQuestion.correctAnswers.every((id: string) => userAnswer.includes(id));

    // Update progress in localStorage
    updateQuestionProgress(category, subcategory, topic, level, currentQuestion.id, isCorrect);

    setSubmitted(true);
    // Explanation now persists until user manually clicks Next or Continue
  };

  const handleFinishQuiz = () => {
    // Calculate results
    let correct = 0;
    const wrongQuestionIds: string[] = [];

    questions.forEach((question: Question) => {
      const userAnswer = userAnswers.get(question.id) || [];
      const isCorrect =
        userAnswer.length === question.correctAnswers.length &&
        userAnswer.every((id: string) => question.correctAnswers.includes(id)) &&
        question.correctAnswers.every((id: string) => userAnswer.includes(id));

      if (isCorrect) {
        correct++;
      } else {
        wrongQuestionIds.push(question.id);
      }
    });

    const results: QuizResults = {
      score: correct,
      total: questions.length,
      percentage: (correct / questions.length) * 100,
      wrongQuestions: [], // Will be populated with full WrongQuestion[] by ResultsScreen
    };

    // Save results to context for results page
    if (quizResultsContext) {
      quizResultsContext.setResults({
        score: correct,
        total: questions.length,
        percentage: (correct / questions.length) * 100,
        wrongQuestions: [],
        level,
        allQuestions: questions,
        wrongQuestionIds,
      });
    }

    onComplete?.(results);
  };

  const hasAnswer = userAnswers.has(currentQuestion.id);
  const selectedAnswers = userAnswers.get(currentQuestion.id) || [];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {topic.charAt(0).toUpperCase() + topic.slice(1)}
            </h1>
            <p className="text-sm text-muted-foreground capitalize">
              Level: {level} • Question {currentIndex + 1} of {totalQuestions}
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="mb-8">
        <QuestionCard
          question={currentQuestion}
          selectedAnswers={selectedAnswers}
          onSelectAnswer={handleSelectAnswer}
          progress={questionProgress}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-between">
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === totalQuestions - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          {!submitted ? (
            <button
              onClick={handleSubmitQuestion}
              disabled={!hasAnswer}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Answer
            </button>
          ) : currentIndex === totalQuestions - 1 ? (
            <button
              onClick={handleFinishQuiz}
              className="px-6 py-2 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              Finish Quiz
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2 bg-slate-600 dark:bg-slate-500 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>

      {/* Explanation (shown after submission) */}
      {submitted && currentQuestion.explanation && (
        <div className="mt-8 p-4 bg-background border border-border rounded-lg">
          <p className="text-sm font-medium text-foreground">Explanation:</p>
          <p className="text-sm text-muted-foreground mt-1">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Keyboard Navigation Info */}
      <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        💡 Select answer(s) and click "Submit Answer" to continue
      </div>
    </div>
  );
}
