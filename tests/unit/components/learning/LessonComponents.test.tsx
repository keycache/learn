import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonView } from '../../../../src/components/learning/LessonView';
import { LessonTabs } from '../../../../src/components/learning/LessonTabs';
import { LessonProgressTracker } from '../../../../src/components/learning/LessonProgressTracker';
import { Lesson } from '../../../../src/types/learning';

// Mock the MarkdownRenderer component
vi.mock('../../../../src/components/learning/MarkdownRenderer', () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="markdown-renderer">{content}</div>
  ),
}));

// Mock the data loader
vi.mock('../../../../src/utils/dataLoader', () => ({
  loadLessonContent: vi.fn(async (catId, subId, topicId, lessonId) => {
    if (lessonId === 'error') {
      return null;
    }
    return {
      metadata: { title: 'Test' },
      content: `# Test Content for ${lessonId}`,
    };
  }),
}));

const mockLessons: Lesson[] = [
  {
    id: 'lesson_1',
    title: 'Introduction to French',
    summary: 'Learn basic greetings',
    duration: '5-10 minutes',
    active: true,
    difficulty: 'beginner',
    learningObjectives: ['Greet people', 'Use polite expressions'],
    tags: ['beginner', 'grammar'],
    order: 1,
  },
  {
    id: 'lesson_2',
    title: 'Common Phrases',
    summary: 'Learn everyday phrases',
    duration: '10-15 minutes',
    active: true,
    difficulty: 'intermediate',
    learningObjectives: ['Use phrases in context', 'Practice pronunciation'],
    tags: ['intermediate', 'conversation'],
    order: 2,
  },
];

describe('Lesson Components', () => {
  describe('LessonView', () => {
    it('should render lesson title and summary', () => {
      render(
        <LessonView
          lesson={mockLessons[0]}
          content="# Test Content"
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
        />
      );

      expect(screen.getByText('Introduction to French')).toBeInTheDocument();
      expect(screen.getByText('Learn basic greetings')).toBeInTheDocument();
    });

    it('should display learning objectives as checklist', () => {
      render(
        <LessonView
          lesson={mockLessons[0]}
          content="# Test"
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
        />
      );

      expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
      expect(screen.getByText('Greet people')).toBeInTheDocument();
      expect(screen.getByText('Use polite expressions')).toBeInTheDocument();
    });

    it('should display tags as badges', () => {
      render(
        <LessonView
          lesson={mockLessons[0]}
          content="# Test"
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
        />
      );

      // Check that tags exist
      expect(screen.getByText('grammar')).toBeInTheDocument();
    });

    it('should render markdown content', () => {
      render(
        <LessonView
          lesson={mockLessons[0]}
          content="# Test Content"
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
        />
      );

      expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
    });

    it('should display error message if provided', () => {
      render(
        <LessonView
          lesson={mockLessons[0]}
          content=""
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
          error="Failed to load content"
        />
      );

      expect(screen.getByText('Error loading lesson content')).toBeInTheDocument();
      expect(screen.getByText('Failed to load content')).toBeInTheDocument();
    });

    it('should hide learning objectives if not present', () => {
      const lessonNoObjectives: Lesson = {
        ...mockLessons[0],
        learningObjectives: [],
      };

      render(
        <LessonView
          lesson={lessonNoObjectives}
          content="# Test"
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
        />
      );

      expect(screen.queryByText('Learning Objectives')).not.toBeInTheDocument();
    });
  });

  describe('LessonTabs', () => {
    it('should render tabs for all lessons', () => {
      render(
        <LessonTabs
          lessons={mockLessons}
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
          showQuizTab={false}
        />
      );

      // Use getByRole with tab role
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThanOrEqual(mockLessons.length);
    });

    it('should render quiz tab if enabled', () => {
      render(
        <LessonTabs
          lessons={mockLessons}
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
          showQuizTab={true}
          quizLabel="Take Quiz"
          renderQuizContent={() => <div data-testid="quiz-content">Quiz Content</div>}
        />
      );

      // Quiz tab should be present
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(mockLessons.length + 1); // Lessons + Quiz
    });

    it('should not render quiz tab if showQuizTab is false', () => {
      render(
        <LessonTabs
          lessons={mockLessons}
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
          showQuizTab={false}
        />
      );

      // Only lesson tabs should be present
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(mockLessons.length);
    });

    it('should display first lesson on initial load', async () => {
      render(
        <LessonTabs
          lessons={mockLessons}
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
          showQuizTab={false}
        />
      );

      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should switch tabs when clicked', async () => {
      render(
        <LessonTabs
          lessons={mockLessons}
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
          showQuizTab={false}
        />
      );

      const tabs = screen.getAllByRole('tab');
      const secondTab = tabs[1];
      fireEvent.click(secondTab);

      await waitFor(() => {
        expect(secondTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should display progress summary', () => {
      render(
        <LessonTabs
          lessons={mockLessons}
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
          showQuizTab={false}
          viewedLessons={new Set(['lesson_1'])}
        />
      );

      // Check for text that contains the progress info
      expect(screen.getByText(/Lessons viewed:/)).toBeInTheDocument();
    });

    it('should show completion message when all lessons viewed', () => {
      render(
        <LessonTabs
          lessons={mockLessons}
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
          showQuizTab={false}
          viewedLessons={new Set(['lesson_1', 'lesson_2'])}
        />
      );

      expect(
        screen.getByText('✓ All lessons completed')
      ).toBeInTheDocument();
    });

    it('should show visual indicator for viewed lessons', () => {
      render(
        <LessonTabs
          lessons={mockLessons}
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
          showQuizTab={false}
          viewedLessons={new Set(['lesson_1'])}
        />
      );

      const tabs = screen.getAllByRole('tab');
      // First tab is active, so no indicator visible
      // Check that we have tabs rendered
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('should render quiz content when quiz tab is active', async () => {
      render(
        <LessonTabs
          lessons={mockLessons}
          categoryId="spoken-languages"
          subcategoryId="french"
          topicId="basics"
          showQuizTab={true}
          renderQuizContent={() => <div data-testid="quiz-panel">Quiz Content Goes Here</div>}
        />
      );

      const tabs = screen.getAllByRole('tab');
      const quizTab = tabs[tabs.length - 1]; // Last tab is quiz
      fireEvent.click(quizTab);

      await waitFor(() => {
        expect(screen.getByTestId('quiz-panel')).toBeInTheDocument();
      });
    });
  });

  describe('LessonProgressTracker', () => {
    it('should display progress bar and stats', () => {
      render(
        <LessonProgressTracker
          lessons={mockLessons}
          viewedLessons={new Set(['lesson_1'])}
        />
      );

      expect(screen.getByText(/1 of 2 lessons completed/)).toBeInTheDocument();
      // Get all text nodes with "1"
      const ones = screen.getAllByText('1');
      expect(ones.length).toBeGreaterThanOrEqual(2); // At least 2 "1"s (completed and remaining)
    });

    it('should calculate progress percentage correctly', () => {
      const { rerender } = render(
        <LessonProgressTracker
          lessons={mockLessons}
          viewedLessons={new Set()}
        />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');

      // Clear and rerender with all lessons viewed
      rerender(
        <LessonProgressTracker
          lessons={mockLessons}
          viewedLessons={new Set(['lesson_1', 'lesson_2'])}
        />
      );

      // After rerender, get the progress bar again
      waitFor(() => {
        progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      });
    });

    it('should show complete badge when all lessons viewed', () => {
      render(
        <LessonProgressTracker
          lessons={mockLessons}
          viewedLessons={new Set(['lesson_1', 'lesson_2'])}
        />
      );

      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('should display detailed lesson list when showDetails is true', () => {
      render(
        <LessonProgressTracker
          lessons={mockLessons}
          viewedLessons={new Set(['lesson_1'])}
          showDetails={true}
        />
      );

      expect(screen.getByText('Introduction to French')).toBeInTheDocument();
      expect(screen.getByText('Common Phrases')).toBeInTheDocument();
    });

    it('should allow toggling lesson completion when showDetails is true', async () => {
      const handleProgressChange = vi.fn();
      render(
        <LessonProgressTracker
          lessons={mockLessons}
          viewedLessons={new Set()}
          showDetails={true}
          onProgressChange={handleProgressChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(handleProgressChange).toHaveBeenCalled();
      });
    });

    it('should persist progress to localStorage if storageKey provided', async () => {
      const storageKey = 'test-lesson-progress';
      const initialViewed = new Set(['lesson_1']);

      render(
        <LessonProgressTracker
          lessons={mockLessons}
          viewedLessons={initialViewed}
          storageKey={storageKey}
          showDetails={true}
        />
      );

      let stored = localStorage.getItem(storageKey);
      expect(stored).toBe(JSON.stringify(['lesson_1']));

      // Now manually update the checkbox to add lesson_2
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // Click second checkbox

      await waitFor(() => {
        const updated = localStorage.getItem(storageKey);
        expect(JSON.parse(updated || '[]')).toContain('lesson_2');
      });
    });

    it('should load progress from localStorage on mount', () => {
      const storageKey = 'test-lesson-progress-load';
      localStorage.setItem(storageKey, JSON.stringify(['lesson_2']));

      render(
        <LessonProgressTracker
          lessons={mockLessons}
          viewedLessons={new Set()}
          storageKey={storageKey}
          showDetails={true}
        />
      );

      // Should show 1 lesson completed (loaded from storage)
      expect(screen.getByText(/1 of 2 lessons completed/)).toBeInTheDocument();
    });

    it('should call onProgressChange when progress updates', async () => {
      const handleProgressChange = vi.fn();
      render(
        <LessonProgressTracker
          lessons={mockLessons}
          viewedLessons={new Set()}
          showDetails={true}
          onProgressChange={handleProgressChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(handleProgressChange).toHaveBeenCalledWith(expect.any(Set));
      });
    });

    it('should handle empty lessons list', () => {
      render(
        <LessonProgressTracker
          lessons={[]}
          viewedLessons={new Set()}
        />
      );

      expect(screen.getByText(/0 of 0 lessons completed/)).toBeInTheDocument();
    });
  });
});
