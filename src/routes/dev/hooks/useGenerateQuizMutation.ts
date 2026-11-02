/**
 * Hook for generating quizzes with LLM
 * Handles API calls, loading states, error handling, and response validation
 * Phase 8.5
 */

import { useCallback } from 'react';
import { getLLMService } from '../../../services/llm';
import { useGeneration } from './useGeneration';
import { interpolateQuizPrompt, QUIZ_PROMPTS } from '../prompts/quizPrompts';
import { useLLMSettings } from './useLLMSettings';

export interface GenerateQuizParams {
  category: string;
  subcategory: string;
  topic: string;
  lessonTitle: string;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  customInstructions: string;
  promptTemplate: 'standard' | 'vocabulary' | 'grammar' | 'comprehension';
}

export function useGenerateQuizMutation() {
  const { setLoading, setError, setResult, setValidationErrors } = useGeneration();
  const { settings } = useLLMSettings();

  const generateQuiz = useCallback(
    async (params: GenerateQuizParams) => {
      try {
        // Validate prerequisites
        if (!settings.provider || !settings.apiKey) {
          setError('Please configure LLM settings first (select provider and enter API key)');
          return;
        }

        if (!params.topic || !params.lessonTitle || !params.customInstructions.trim()) {
          setError('Please fill in all required fields');
          return;
        }

        const totalQuestions = params.easyCount + params.mediumCount + params.hardCount;
        if (totalQuestions === 0) {
          setError('Please specify at least one question');
          return;
        }

        setLoading(true);

        // Get the prompt template
        const selectedPrompt = QUIZ_PROMPTS[params.promptTemplate];
        
        // Interpolate user prompt with form values
        const userPrompt = interpolateQuizPrompt(selectedPrompt.userPrompt, {
          category: params.category,
          subcategory: params.subcategory,
          topic: params.topic,
          lessonTitle: params.lessonTitle,
          easyCount: params.easyCount,
          mediumCount: params.mediumCount,
          hardCount: params.hardCount,
          totalCount: totalQuestions,
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

        // Call LLMService to generate quiz
        const response = await llmService.generateQuiz({
          systemPrompt,
          userPrompt,
        });

        if (!response.success) {
          const validationErrors = Array.isArray(response.validationErrors)
            ? response.validationErrors.map((detail: any) => 
                `${detail.path?.join('.') || 'Unknown field'}: ${detail.message}`
              )
            : [];
          
          setValidationErrors(validationErrors);
          setError(response.error || 'Failed to generate quiz');
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
    [settings, setLoading, setError, setResult, setValidationErrors]
  );

  return { generateQuiz };
}
