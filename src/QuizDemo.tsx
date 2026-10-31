import { useState, useEffect } from 'react';
import { Quiz } from './components/learning/Quiz';
import { loadLevel } from './utils/dataLoader';
import { Question } from './types/learning';

interface QuizResults {
  score: number;
  total: number;
  percentage: number;
  wrongQuestions: string[];
}

export default function QuizDemo() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<QuizResults | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      const loadedQuestions = await loadLevel('spoken-languages', 'french', 'numbers', 'easy');
      setQuestions(loadedQuestions);
      setLoading(false);
    };

    loadQuestions();
  }, []);

  const handleQuizComplete = (quizResults: QuizResults) => {
    setResults(quizResults);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600 dark:text-slate-400">Loading questions...</p>
      </div>
    );
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Quiz Complete!
            </h1>
            <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              {results.percentage.toFixed(1)}%
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              You got {results.score} out of {results.total} correct
            </p>
            <button
              onClick={() => {
                setResults(null);
                window.location.reload();
              }}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600 dark:text-slate-400">No questions available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        questions={questions}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}
