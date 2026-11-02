import React, { createContext, useCallback, useEffect, useState } from 'react';

export interface LLMSettings {
  provider: string;
  apiKey: string;
  isConnected: boolean;
  lastTestedAt: string | null;
}

interface LLMSettingsContextType {
  settings: LLMSettings;
  updateApiKey: (apiKey: string) => void;
  updateProvider: (provider: string) => void;
  setConnected: (isConnected: boolean, testedAt?: string) => void;
  clearSettings: () => void;
}

export const LLMSettingsContext = createContext<LLMSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'dev_llm_settings';
const API_KEY_STORAGE_KEY = 'dev_llm_apikeys';

const DEFAULT_SETTINGS: LLMSettings = {
  provider: 'openrouter',
  apiKey: '',
  isConnected: false,
  lastTestedAt: null,
};

export function LLMSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<LLMSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    const savedApiKeys = localStorage.getItem(API_KEY_STORAGE_KEY);

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse LLM settings from localStorage:', e);
      }
    }

    if (savedApiKeys) {
      try {
        const apiKeys = JSON.parse(savedApiKeys);
        const provider = savedSettings ? JSON.parse(savedSettings).provider : 'openrouter';
        if (apiKeys[provider]) {
          setSettings((prev) => ({ ...prev, apiKey: apiKeys[provider] }));
        }
      } catch (e) {
        console.error('Failed to parse API keys from localStorage:', e);
      }
    }

    setIsLoaded(true);
  }, []);

  // Persist to localStorage when settings change
  useEffect(() => {
    if (!isLoaded) return;

    const { apiKey, ...settingsToSave } = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));

    // Save API key separately
    const apiKeys = JSON.parse(localStorage.getItem(API_KEY_STORAGE_KEY) || '{}');
    if (apiKey) {
      apiKeys[settings.provider] = apiKey;
    } else {
      delete apiKeys[settings.provider];
    }
    localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(apiKeys));
  }, [settings, isLoaded]);

  const updateApiKey = useCallback((apiKey: string) => {
    setSettings((prev) => ({ ...prev, apiKey }));
  }, []);

  const updateProvider = useCallback((provider: string) => {
    setSettings((prev) => {
      // Try to load API key for new provider from localStorage
      const apiKeys = JSON.parse(localStorage.getItem(API_KEY_STORAGE_KEY) || '{}');
      return {
        ...prev,
        provider,
        apiKey: apiKeys[provider] || '',
        isConnected: false,
        lastTestedAt: null,
      };
    });
  }, []);

  const setConnected = useCallback((isConnected: boolean, testedAt?: string) => {
    setSettings((prev) => ({
      ...prev,
      isConnected,
      lastTestedAt: isConnected ? testedAt || new Date().toISOString() : prev.lastTestedAt,
    }));
  }, []);

  const clearSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }, []);

  return (
    <LLMSettingsContext.Provider
      value={{
        settings,
        updateApiKey,
        updateProvider,
        setConnected,
        clearSettings,
      }}
    >
      {children}
    </LLMSettingsContext.Provider>
  );
}
