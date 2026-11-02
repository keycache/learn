import React, { createContext, useCallback, useEffect, useState } from 'react';

export interface Selection {
  category: string | null;
  subcategory: string | null;
  topic: string | null;
  type: 'lesson' | 'quiz' | null;
}

interface SelectionContextType {
  selection: Selection;
  setCategory: (category: string | null) => void;
  setSubcategory: (subcategory: string | null) => void;
  setTopic: (topic: string | null) => void;
  setType: (type: 'lesson' | 'quiz' | null) => void;
  resetSelection: () => void;
}

export const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

const STORAGE_KEY = 'dev_selection';

const DEFAULT_SELECTION: Selection = {
  category: null,
  subcategory: null,
  topic: null,
  type: null,
};

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<Selection>(DEFAULT_SELECTION);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelection(parsed);
      } catch (e) {
        console.error('Failed to parse selection from localStorage:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage when selection changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  }, [selection, isLoaded]);

  const setCategory = useCallback((category: string | null) => {
    setSelection((prev) => ({
      ...prev,
      category,
      subcategory: null,
      topic: null,
    }));
  }, []);

  const setSubcategory = useCallback((subcategory: string | null) => {
    setSelection((prev) => ({
      ...prev,
      subcategory,
      topic: null,
    }));
  }, []);

  const setTopic = useCallback((topic: string | null) => {
    setSelection((prev) => ({
      ...prev,
      topic,
    }));
  }, []);

  const setType = useCallback((type: 'lesson' | 'quiz' | null) => {
    setSelection((prev) => ({
      ...prev,
      type,
    }));
  }, []);

  const resetSelection = useCallback(() => {
    setSelection(DEFAULT_SELECTION);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        selection,
        setCategory,
        setSubcategory,
        setTopic,
        setType,
        resetSelection,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}
