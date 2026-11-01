import React from 'react';
import { Lesson } from '../../types/learning';
import { Badge } from '../ui/badge';
import MarkdownRenderer from './MarkdownRenderer';

interface LessonViewProps {
  lesson: Lesson;
  content: string; // Raw markdown content
  categoryId: string;
  subcategoryId: string;
  topicId: string;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * LessonView Component
 * Displays a single lesson with metadata and rendered markdown content
 *
 * Features:
 * - Lesson title, summary, and duration
 * - Difficulty badge and tags
 * - Learning objectives checklist
 * - Markdown content rendering
 * - Responsive card layout
 * - Dark mode support
 */
export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  content,
  categoryId,
  subcategoryId,
  topicId,
  isLoading = false,
  error = null,
}) => {
  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lesson.title}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {lesson.summary}
          </p>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Duration */}
          <span className="inline-flex h-6 items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">
            ⏱️ {lesson.duration}
          </span>

          {/* Difficulty */}
          <Badge
            variant={
              lesson.difficulty === 'beginner'
                ? 'default'
                : lesson.difficulty === 'intermediate'
                  ? 'secondary'
                  : 'destructive'
            }
            className="capitalize"
          >
            {lesson.difficulty}
          </Badge>

          {/* Tags */}
          {lesson.tags && lesson.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lesson.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Learning Objectives */}
      {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-foreground">
            Learning Objectives
          </h2>
          <ul className="space-y-2">
            {lesson.learningObjectives.map((objective, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-muted-foreground accent-blue-600 dark:accent-blue-400"
                  disabled
                  aria-label={`Objective: ${objective}`}
                />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Lesson Content */}
      <h2 className="text-lg font-bold text-foreground mb-3">
        Lesson Content
      </h2>
      {error ? (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-600 dark:text-red-400">
          <p className="font-semibold">Error loading lesson content</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : (
        <MarkdownRenderer
          content={content}
          categoryId={categoryId}
          subcategoryId={subcategoryId}
          topicId={topicId}
          lessonId={lesson.id}
          className="text-foreground"
        />
      )}
    </div>
  );
};

export default LessonView;
