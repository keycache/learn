import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsScreen } from '@/components/learning/ResultsScreen';
import { LevelSelector } from '@/components/learning/LevelSelector';
import { Question } from '@/types/learning';
import {
  isLevelPassed,
  canAccessLevel,
  getNextAvailableLevel,
  getLevelStatus,
  getDetailedLevelProgress,
} from '@/utils/levelProgression';
import { updateQuestionProgress, clearAllProgress } from '@/utils/progressTracker';

// Mock data
const mockQuestions: Question[] = [
  {
    id: 'q-easy-00',
    text: 'What is 1 + 1?',
    options: [
      { id: 'opt-easy-00-a', text: '2' },
      { id: 'opt-easy-00-b', text: '3' },
    ],
    correctAnswers: ['opt-easy-00-a'],
  },
  {
    id: 'q-easy-01',
    text: 'What is 2 + 2?',
    options: [
      { id: 'opt-easy-01-a', text: '4' },
      { id: 'opt-easy-01-b', text: '5' },
    ],
    correctAnswers: ['opt-easy-01-a'],
  },
];

describe('ResultsScreen', () => {
  it('renders results with score and percentage', () => {
    render(
      <ResultsScreen
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        score={15}
        total={20}
        wrongQuestionIds={[]}
        allQuestions={mockQuestions}
      />
    );

    expect(screen.getByText(/Numbers - Easy/)).toBeInTheDocument();
    expect(screen.getByText(/75%/)).toBeInTheDocument();
    expect(screen.getByText(/15 out of 20/)).toBeInTheDocument();
  });

  it('displays performance level based on score', () => {
    const { rerender } = render(
      <ResultsScreen
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        score={18}
        total={20}
        wrongQuestionIds={[]}
        allQuestions={mockQuestions}
      />
    );

    expect(screen.getByText('Excellent')).toBeInTheDocument();

    rerender(
      <ResultsScreen
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        score={12}
        total={20}
        wrongQuestionIds={[]}
        allQuestions={mockQuestions}
      />
    );

    expect(screen.getByText('Fair')).toBeInTheDocument();
  });

  it('shows stats grid with correct/incorrect/total', () => {
    render(
      <ResultsScreen
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        score={15}
        total={20}
        wrongQuestionIds={[]}
        allQuestions={mockQuestions}
      />
    );

    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('displays wrong questions with explanations', () => {
    const questionsWithExplanations: Question[] = [
      {
        ...mockQuestions[0],
        explanation: 'One plus one equals two.',
      },
    ];

    render(
      <ResultsScreen
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        score={0}
        total={1}
        wrongQuestionIds={['q-easy-00']}
        allQuestions={questionsWithExplanations}
      />
    );

    expect(screen.getByText(/Questions to Review/)).toBeInTheDocument();
    expect(screen.getByText('What is 1 + 1?')).toBeInTheDocument();
    expect(screen.getByText(/One plus one equals two/)).toBeInTheDocument();
  });

  it('calls onRetry when try again button clicked', () => {
    const handleRetry = vi.fn();

    render(
      <ResultsScreen
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        score={10}
        total={20}
        wrongQuestionIds={[]}
        allQuestions={mockQuestions}
        onRetry={handleRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /Try Again/ });
    fireEvent.click(retryButton);

    expect(handleRetry).toHaveBeenCalled();
  });

  it('calls onBack when back button clicked', () => {
    const handleBack = vi.fn();

    render(
      <ResultsScreen
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        score={10}
        total={20}
        wrongQuestionIds={[]}
        allQuestions={mockQuestions}
        onBack={handleBack}
      />
    );

    const backButton = screen.getByRole('button', { name: /Back to Topics/ });
    fireEvent.click(backButton);

    expect(handleBack).toHaveBeenCalled();
  });
});

describe('LevelSelector', () => {
  beforeEach(() => {
    clearAllProgress();
  });

  it('renders all three difficulty levels', () => {
    render(
      <LevelSelector
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        onSelectLevel={vi.fn()}
      />
    );

    expect(screen.getByText('easy')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('hard')).toBeInTheDocument();
  });

  it('easy level is always available', () => {
    render(
      <LevelSelector
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        onSelectLevel={vi.fn()}
      />
    );

    const easyButtons = screen.getAllByRole('button');
    const easyButton = easyButtons[0];
    expect(easyButton).not.toBeDisabled();
  });

  it('medium and hard levels are locked initially', () => {
    render(
      <LevelSelector
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        onSelectLevel={vi.fn()}
      />
    );

    const lockedTexts = screen.getAllByText('Locked');
    expect(lockedTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onSelectLevel when available level is clicked', () => {
    const handleSelectLevel = vi.fn();

    render(
      <LevelSelector
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        onSelectLevel={handleSelectLevel}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // Easy level

    expect(handleSelectLevel).toHaveBeenCalledWith('easy');
  });

  it('does not call onSelectLevel when locked level is clicked', () => {
    const handleSelectLevel = vi.fn();

    render(
      <LevelSelector
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        onSelectLevel={handleSelectLevel}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // Medium level (locked)

    expect(handleSelectLevel).not.toHaveBeenCalled();
  });
});

describe('Level Progression Logic', () => {
  beforeEach(() => {
    clearAllProgress();
  });

  afterEach(() => {
    clearAllProgress();
  });

  it('easy level is always accessible', () => {
    const canAccess = canAccessLevel('spoken-languages', 'french', 'numbers', 'easy');
    expect(canAccess).toBe(true);
  });

  it('medium level is locked without easy passed', () => {
    const canAccess = canAccessLevel('spoken-languages', 'french', 'numbers', 'medium');
    expect(canAccess).toBe(false);
  });

  it('medium level unlocks after easy is passed', () => {
    // Simulate passing easy level (70%+)
    for (let i = 0; i < 7; i++) {
      updateQuestionProgress('spoken-languages', 'french', 'numbers', 'easy', `q-easy-${i}`, true);
    }
    for (let i = 0; i < 3; i++) {
      updateQuestionProgress('spoken-languages', 'french', 'numbers', 'easy', `q-easy-${i + 7}`, false);
    }

    const canAccess = canAccessLevel('spoken-languages', 'french', 'numbers', 'medium');
    expect(canAccess).toBe(true);
  });

  it('hard level is locked without medium passed', () => {
    const canAccess = canAccessLevel('spoken-languages', 'french', 'numbers', 'hard');
    expect(canAccess).toBe(false);
  });

  it('determines level status correctly', () => {
    const status = getLevelStatus('spoken-languages', 'french', 'numbers', 'easy');
    expect(status).toBe('available');

    const mediumStatus = getLevelStatus('spoken-languages', 'french', 'numbers', 'medium');
    expect(mediumStatus).toBe('locked');
  });

  it('returns next available level', () => {
    const nextLevel = getNextAvailableLevel('spoken-languages', 'french', 'numbers');
    expect(nextLevel).toBe('easy');
  });

  it('returns null when all levels completed', () => {
    // Simulate passing all levels
    for (let level of ['easy', 'medium', 'hard'] as const) {
      for (let i = 0; i < 7; i++) {
        updateQuestionProgress('spoken-languages', 'french', 'numbers', level, `q-${level}-${i}`, true);
      }
      for (let i = 0; i < 3; i++) {
        updateQuestionProgress('spoken-languages', 'french', 'numbers', level, `q-${level}-${i + 7}`, false);
      }
    }

    const nextLevel = getNextAvailableLevel('spoken-languages', 'french', 'numbers');
    expect(nextLevel).toBeNull();
  });

  it('isLevelPassed returns false when threshold not met', () => {
    for (let i = 0; i < 5; i++) {
      updateQuestionProgress('spoken-languages', 'french', 'numbers', 'easy', `q-easy-${i}`, true);
    }
    for (let i = 0; i < 5; i++) {
      updateQuestionProgress('spoken-languages', 'french', 'numbers', 'easy', `q-easy-${i + 5}`, false);
    }

    const passed = isLevelPassed('spoken-languages', 'french', 'numbers', 'easy');
    expect(passed).toBe(false); // 50% < 70%
  });

  it('isLevelPassed returns true when threshold met', () => {
    for (let i = 0; i < 7; i++) {
      updateQuestionProgress('spoken-languages', 'french', 'numbers', 'easy', `q-easy-${i}`, true);
    }
    for (let i = 0; i < 3; i++) {
      updateQuestionProgress('spoken-languages', 'french', 'numbers', 'easy', `q-easy-${i + 7}`, false);
    }

    const passed = isLevelPassed('spoken-languages', 'french', 'numbers', 'easy');
    expect(passed).toBe(true); // 70% >= 70%
  });

  it('getDetailedLevelProgress returns correct metrics', () => {
    for (let i = 0; i < 7; i++) {
      updateQuestionProgress('spoken-languages', 'french', 'numbers', 'easy', `q-easy-${i}`, true);
    }
    for (let i = 0; i < 3; i++) {
      updateQuestionProgress('spoken-languages', 'french', 'numbers', 'easy', `q-easy-${i + 7}`, false);
    }

    const progress = getDetailedLevelProgress('spoken-languages', 'french', 'numbers', 'easy');
    expect(progress.correctCount).toBe(7);
    expect(progress.totalQuestions).toBe(10);
    expect(progress.percentage).toBe(70);
  });
});
