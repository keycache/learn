import { useState, useEffect } from 'react';
import { Quiz } from './components/learning/Quiz';
import { ResultsScreen } from './components/learning/ResultsScreen';
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

  const handleRetry = () => {
    setResults(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600 dark:text-slate-400">Loading questions...</p>
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

  if (results) {
    return (
      <ResultsScreen
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        score={results.score}
        total={results.total}
        wrongQuestionIds={results.wrongQuestions}
        allQuestions={questions}
        onRetry={handleRetry}
      />
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
