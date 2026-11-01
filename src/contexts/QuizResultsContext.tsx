import { createContext, useState, ReactNode } from 'react';
import { Question, QuizResults } from '@/types/learning';

export interface QuizResultsContextType {
  results: QuizResultsWithQuestions | null;
  setResults: (results: QuizResultsWithQuestions | null) => void;
}

export interface QuizResultsWithQuestions extends QuizResults {
  level: 'easy' | 'medium' | 'hard';
  allQuestions: Question[];
  wrongQuestionIds: string[]; // IDs only, used for quick lookup
}

export const QuizResultsContext = createContext<QuizResultsContextType | undefined>(undefined);

export function QuizResultsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<QuizResultsWithQuestions | null>(null);

  return (
    <QuizResultsContext.Provider value={{ results, setResults }}>
      {children}
    </QuizResultsContext.Provider>
  );
}
