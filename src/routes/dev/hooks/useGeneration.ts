import { useContext } from 'react';
import { GenerationContext } from '../contexts/GenerationContext';

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
}
