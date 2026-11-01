import React, { useState, useCallback, useEffect } from 'react';
import { Lesson } from '../../types/learning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface LessonProgressTrackerProps {
  lessons: Lesson[];
  viewedLessons?: Set<string>;
  onProgressChange?: (viewed: Set<string>) => void;
  showDetails?: boolean;
  storageKey?: string;
}

/**
 * LessonProgressTracker Component
 * Tracks and displays lesson progress
 *
 * Features:
 * - Visual progress bar
 * - Viewed lesson tracking
 * - Optional localStorage persistence
 * - Detailed lesson status display
 * - Dark mode support
 */
export const LessonProgressTracker: React.FC<LessonProgressTrackerProps> = ({
  lessons,
  viewedLessons = new Set(),
  onProgressChange,
  showDetails = false,
  storageKey,
}) => {
  const [viewed, setViewed] = useState<Set<string>>(viewedLessons);

  // Load from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          setViewed(new Set(parsed));
        }
      } catch (error) {
        console.error('Failed to load lesson progress:', error);
      }
    }
  }, [storageKey]);

  // Save to localStorage when viewed changes
  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(viewed)));
      } catch (error) {
        console.error('Failed to save lesson progress:', error);
      }
    }

    onProgressChange?.(viewed);
  }, [viewed, storageKey, onProgressChange]);

  const markLessonAsViewed = useCallback((lessonId: string) => {
    setViewed((prev) => {
      const next = new Set(prev);
      next.add(lessonId);
      return next;
    });
  }, []);

  const markLessonAsUnviewed = useCallback((lessonId: string) => {
    setViewed((prev) => {
      const next = new Set(prev);
      next.delete(lessonId);
      return next;
    });
  }, []);

  const progress = lessons.length > 0 ? (viewed.size / lessons.length) * 100 : 0;
  const allViewed = viewed.size === lessons.length && lessons.length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Lesson Progress</CardTitle>
            <CardDescription>
              {viewed.size} of {lessons.length} lessons completed
            </CardDescription>
          </div>
          {allViewed && (
            <Badge className="bg-green-600 dark:bg-green-700 text-white">
              Complete
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Detailed Lesson List */}
        {showDetails && lessons.length > 0 && (
          <div className="space-y-2 border-t border-muted pt-4">
            {lessons.map((lesson) => {
              const isViewed = viewed.has(lesson.id);
              return (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={isViewed}
                      onChange={(e) => {
                        if (e.target.checked) {
                          markLessonAsViewed(lesson.id);
                        } else {
                          markLessonAsUnviewed(lesson.id);
                        }
                      }}
                      className="h-4 w-4 rounded border-muted-foreground accent-blue-600 dark:accent-blue-400"
                      aria-label={`Mark ${lesson.title} as ${isViewed ? 'unviewed' : 'viewed'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isViewed
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground'
                        }`}
                      >
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.duration}
                      </p>
                    </div>
                  </div>
                  {isViewed && (
                    <span className="text-green-600 dark:text-green-400 text-lg">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Completed</p>
            <p className="text-lg font-semibold text-foreground">{viewed.size}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Remaining</p>
            <p className="text-lg font-semibold text-foreground">
              {Math.max(0, lessons.length - viewed.size)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonProgressTracker;
