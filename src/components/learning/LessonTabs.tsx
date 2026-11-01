import React, { useState, useCallback } from 'react';
import { Lesson, MarkdownContent } from '../../types/learning';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import LessonView from './LessonView';

interface LessonTab {
  id: string;
  label: string;
  type: 'lesson' | 'quiz';
  lesson?: Lesson;
}

interface LessonTabsProps {
  lessons: Lesson[];
  categoryId: string;
  subcategoryId: string;
  topicId: string;
  onLessonLoad?: (lessonId: string, content: MarkdownContent) => void;
  showQuizTab?: boolean;
  quizLabel?: string;
  renderQuizContent?: () => React.ReactNode;
  viewedLessons?: Set<string>;
}

/**
 * LessonTabs Component
 * Tabbed interface for displaying lessons and quiz
 *
 * Features:
 * - Tab-based navigation between lessons
 * - Lazy loading of lesson content
 * - Visual indicators for viewed lessons
 * - Quiz tab at end (optional)
 * - Responsive design
 * - Dark mode support
 * - Keyboard navigation
 */
export const LessonTabs: React.FC<LessonTabsProps> = ({
  lessons,
  categoryId,
  subcategoryId,
  topicId,
  onLessonLoad,
  showQuizTab = true,
  quizLabel = 'Quiz',
  renderQuizContent,
  viewedLessons = new Set(),
}) => {
  // Create tabs from lessons
  const lessonTabs: LessonTab[] = lessons.map((lesson) => ({
    id: lesson.id,
    label: lesson.title,
    type: 'lesson',
    lesson,
  }));

  // Add quiz tab if enabled
  const allTabs: LessonTab[] =
    showQuizTab && renderQuizContent
      ? [
          ...lessonTabs,
          {
            id: 'quiz',
            label: quizLabel,
            type: 'quiz',
          },
        ]
      : lessonTabs;

  const [activeTabId, setActiveTabId] = useState<string>(allTabs[0]?.id || '');
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const [lessonContents, setLessonContents] = useState<Map<string, string>>(
    new Map()
  );
  const [lessonErrors, setLessonErrors] = useState<Map<string, string>>(
    new Map()
  );

  // Load lesson content when tab is clicked
  const handleTabChange = useCallback(
    async (tabId: string) => {
      setActiveTabId(tabId);

      const tab = allTabs.find((t) => t.id === tabId);
      if (!tab || tab.type !== 'lesson' || !tab.lesson) {
        return;
      }

      // Check if already loaded
      if (lessonContents.has(tabId)) {
        return;
      }

      // Load content
      setLoadingLessonId(tabId);
      try {
        const { loadLessonContent } = await import('../../utils/dataLoader');
        const content = await loadLessonContent(
          categoryId,
          subcategoryId,
          topicId,
          tabId
        );

        if (content) {
          setLessonContents((prev) => new Map(prev).set(tabId, content.content));
          lessonErrors.delete(tabId);
          onLessonLoad?.(tabId, content);
        } else {
          setLessonErrors(
            (prev) =>
              new Map(prev).set(tabId, `Failed to load ${tab.lesson?.title}`)
          );
        }
      } catch (error) {
        console.error(`Error loading lesson ${tabId}:`, error);
        setLessonErrors(
          (prev) =>
            new Map(prev).set(
              tabId,
              `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        );
      } finally {
        setLoadingLessonId(null);
      }
    },
    [categoryId, subcategoryId, topicId, allTabs, lessonContents, lessonErrors, onLessonLoad]
  );

  const activeTab = allTabs.find((t) => t.id === activeTabId);
  const isLessonTab = activeTab?.type === 'lesson';
  const currentLesson = isLessonTab ? activeTab?.lesson : null;

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div
        className="flex flex-wrap gap-2 border-b border-muted bg-card rounded-t-lg p-4 overflow-x-auto"
        role="tablist"
      >
        {allTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isViewed = viewedLessons.has(tab.id);
          const isLessonWithView = tab.type === 'lesson' && isViewed;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-content`}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all whitespace-nowrap
                ${
                  isActive
                    ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }
              `}
            >
              <span>{tab.label}</span>

              {/* Viewed indicator */}
              {isLessonWithView && !isActive && (
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              )}

              {/* Loading indicator */}
              {loadingLessonId === tab.id && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <Card className="border-t-0 rounded-t-none bg-card border-border">
        <CardContent className="pt-6">
          {isLessonTab && currentLesson ? (
            <LessonView
              lesson={currentLesson}
              content={lessonContents.get(activeTabId) || ''}
              categoryId={categoryId}
              subcategoryId={subcategoryId}
              topicId={topicId}
              isLoading={loadingLessonId === activeTabId}
              error={lessonErrors.get(activeTabId)}
            />
          ) : activeTab?.type === 'quiz' && renderQuizContent ? (
            <div id={`${activeTabId}-content`} role="tabpanel">
              {renderQuizContent()}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No content available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Summary */}
      {lessons.length > 0 && (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
          <span>
            Lessons viewed: <strong>{viewedLessons.size}</strong> /{' '}
            <strong>{lessons.length}</strong>
          </span>
          {viewedLessons.size === lessons.length && (
            <span className="text-green-600 dark:text-green-400 font-semibold">
              ✓ All lessons completed
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonTabs;
