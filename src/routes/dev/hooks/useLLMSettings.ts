import { useContext } from 'react';
import { LLMSettingsContext } from '../contexts/LLMSettingsContext';

export function useLLMSettings() {
  const context = useContext(LLMSettingsContext);
  if (!context) {
    throw new Error('useLLMSettings must be used within a LLMSettingsProvider');
  }
  return context;
}
