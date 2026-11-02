import React, { createContext, useCallback, useState } from 'react';
import type { GeneratedLesson } from '../types/lesson';
import type { GeneratedQuiz } from '../types/quiz';

export interface Generation {
  isLoading: boolean;
  error: string | null;
  result: GeneratedLesson | GeneratedQuiz | null;
  validationErrors: string[];
  rawResponse?: string;
}

interface GenerationContextType {
  generation: Generation;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setResult: (result: GeneratedLesson | GeneratedQuiz | null) => void;
  setValidationErrors: (errors: string[]) => void;
  setRawResponse: (response: string | undefined) => void;
  clearGeneration: () => void;
}

export const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

const DEFAULT_GENERATION: Generation = {
  isLoading: false,
  error: null,
  result: null,
  validationErrors: [],
  rawResponse: undefined,
};

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const [generation, setGeneration] = useState<Generation>(DEFAULT_GENERATION);

  const setLoading = useCallback((isLoading: boolean) => {
    setGeneration((prev) => ({
      ...prev,
      isLoading,
      ...(isLoading && { error: null, validationErrors: [] }),
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setGeneration((prev) => ({
      ...prev,
      error,
      isLoading: false,
    }));
  }, []);

  const setResult = useCallback((result: GeneratedLesson | GeneratedQuiz | null) => {
    setGeneration((prev) => ({
      ...prev,
      result,
      isLoading: false,
      error: null,
    }));
  }, []);

  const setValidationErrors = useCallback((errors: string[]) => {
    setGeneration((prev) => ({
      ...prev,
      validationErrors: errors,
      isLoading: false,
    }));
  }, []);

  const setRawResponse = useCallback((response: string | undefined) => {
    setGeneration((prev) => ({
      ...prev,
      rawResponse: response,
    }));
  }, []);

  const clearGeneration = useCallback(() => {
    setGeneration(DEFAULT_GENERATION);
  }, []);

  return (
    <GenerationContext.Provider
      value={{
        generation,
        setLoading,
        setError,
        setResult,
        setValidationErrors,
        setRawResponse,
        clearGeneration,
      }}
    >
      {children}
    </GenerationContext.Provider>
  );
}
