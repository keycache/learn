/**
 * Hook for generating lessons with LLM
 * Handles API calls, loading states, error handling, and response validation
 * Phase 8.5
 */

import { useCallback } from 'react';
import { getLLMService } from '../../../services/llm';
import { useGeneration } from './useGeneration';
import { interpolateLessonPrompt, LESSON_PROMPTS } from '../prompts/lessonPrompts';
import { useLLMSettings } from './useLLMSettings';

export interface GenerateLessonParams {
  category: string;
  subcategory: string;
  topic: string;
  ageGroup: string;
  difficulty: string;
  customInstructions: string;
  promptTemplate: 'standard' | 'conversation' | 'grammar';
}

export function useGenerateLessonMutation() {
  const { setLoading, setError, setResult, setValidationErrors, setRawResponse } = useGeneration();
  const { settings } = useLLMSettings();

  const generateLesson = useCallback(
    async (params: GenerateLessonParams) => {
      try {
        // Validate prerequisites
        if (!settings.provider || !settings.apiKey) {
          setError('Please configure LLM settings first (select provider and enter API key)');
          return;
        }

        if (!params.topic || !params.ageGroup || !params.customInstructions.trim()) {
          setError('Please fill in all required fields');
          return;
        }

        setLoading(true);

        // Get the prompt template
        const selectedPrompt = LESSON_PROMPTS[params.promptTemplate];
        
        // Interpolate user prompt with form values
        const userPrompt = interpolateLessonPrompt(selectedPrompt.userPrompt, {
          category: params.category,
          subcategory: params.subcategory,
          topic: params.topic,
          ageGroup: params.ageGroup,
          difficulty: params.difficulty,
          customInstructions: params.customInstructions,
        });

        const systemPrompt = selectedPrompt.systemPrompt;

        // Initialize LLMService
        const llmService = getLLMService();
        await llmService.initialize(settings.provider, {
          name: settings.provider,
          apiKey: settings.apiKey,
          model: settings.modelName,
        });

        // Call LLMService to generate lesson
        // Use higher token limit for comprehensive lessons (64k tokens)
        const response = await llmService.generateLesson({
          systemPrompt,
          userPrompt,
          options: {
            maxTokens: 64000,
          },
        });

        if (!response.success) {
          const validationErrors = Array.isArray(response.validationErrors)
            ? response.validationErrors.map((detail: any) => 
                `${detail.path?.join('.') || 'Unknown field'}: ${detail.message}`
              )
            : [];
          
          setValidationErrors(validationErrors);
          setRawResponse(response.rawResponse);
          setError(response.error || 'Failed to generate lesson');
          return;
        }

        // Set successful result
        if (response.data) {
          setResult(response.data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      }
    },
    [settings, setLoading, setError, setResult, setValidationErrors, setRawResponse]
  );

  return { generateLesson };
}
