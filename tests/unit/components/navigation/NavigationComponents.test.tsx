import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategorySelector } from '@/components/navigation/CategorySelector';
import { SubcategorySelector } from '@/components/navigation/SubcategorySelector';
import { TopicGrid } from '@/components/navigation/TopicGrid';
import { TopicIntro } from '@/components/navigation/TopicIntro';
import * as dataLoader from '@/utils/dataLoader';
import { Category, Subcategory, TopicInfo, Topic } from '@/types/learning';

// Mock the dataLoader module
vi.mock('@/utils/dataLoader', () => ({
  loadCategories: vi.fn(),
  loadSubcategories: vi.fn(),
  loadTopics: vi.fn(),
  loadTopic: vi.fn(),
  randomizeQuestionOptions: vi.fn((q) => q),
}));

// Mock level progression
vi.mock('@/utils/levelProgression', () => ({
  getLevelStatus: vi.fn(() => 'available'),
  getDetailedLevelProgress: vi.fn(() => ({
    correctCount: 0,
    totalQuestions: 30,
    percentage: 0,
  })),
  canAccessLevel: vi.fn(() => true),
}));

// Mock data
const mockCategories: Record<string, Category> = {
  'spoken-languages': {
    id: 'spoken-languages',
    name: 'Spoken Languages',
    description: 'Learn various spoken languages',
    subcategories: [
      {
        id: 'french',
        name: 'French',
        description: 'Learn French',
        category: 'spoken-languages',
      },
      {
        id: 'spanish',
        name: 'Spanish',
        description: 'Learn Spanish',
        category: 'spoken-languages',
      },
    ],
  },
};

const mockSubcategories: Subcategory[] = [
  {
    id: 'french',
    name: 'French',
    description: 'Learn French',
    category: 'spoken-languages',
  },
  {
    id: 'spanish',
    name: 'Spanish',
    description: 'Learn Spanish',
    category: 'spoken-languages',
  },
];

const mockTopics: TopicInfo[] = [
  { id: 'numbers', name: 'Numbers' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'vegetables', name: 'Vegetables' },
];

const mockTopic: Topic = {
  id: 'numbers',
  name: 'Numbers',
  description: 'Learn numbers in French',
  category: 'spoken-languages',
  subcategory: 'french',
  levels: {
    easy: {
      level: 'easy',
      description: 'Easy numbers',
      questionCount: 30,
      questions: Array(30)
        .fill(null)
        .map((_, i) => ({
          id: `q-easy-${i}`,
          text: `Question ${i + 1}`,
          options: [
            { id: `opt-${i}-a`, text: 'Option A' },
            { id: `opt-${i}-b`, text: 'Option B' },
          ],
          correctAnswers: [`opt-${i}-a`],
        })),
    },
    medium: {
      level: 'medium',
      description: 'Medium numbers',
      questionCount: 30,
      questions: Array(30)
        .fill(null)
        .map((_, i) => ({
          id: `q-medium-${i}`,
          text: `Question ${i + 1}`,
          options: [
            { id: `opt-${i}-a`, text: 'Option A' },
            { id: `opt-${i}-b`, text: 'Option B' },
          ],
          correctAnswers: [`opt-${i}-a`],
        })),
    },
    hard: {
      level: 'hard',
      description: 'Hard numbers',
      questionCount: 30,
      questions: Array(30)
        .fill(null)
        .map((_, i) => ({
          id: `q-hard-${i}`,
          text: `Question ${i + 1}`,
          options: [
            { id: `opt-${i}-a`, text: 'Option A' },
            { id: `opt-${i}-b`, text: 'Option B' },
          ],
          correctAnswers: [`opt-${i}-a`],
        })),
    },
  },
};

describe('CategorySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (dataLoader.loadCategories as any).mockResolvedValue(mockCategories);
  });

  it('renders loading state initially', () => {
    render(<CategorySelector onSelectCategory={vi.fn()} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders categories after loading', async () => {
    const handleSelect = vi.fn();
    render(<CategorySelector onSelectCategory={handleSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Spoken Languages')).toBeInTheDocument();
    });
  });

  it('calls callback when category is selected', async () => {
    const handleSelect = vi.fn();
    render(<CategorySelector onSelectCategory={handleSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Spoken Languages')).toBeInTheDocument();
    });

    const categoryButton = screen.getByText('Spoken Languages');
    fireEvent.click(categoryButton);

    expect(handleSelect).toHaveBeenCalledWith('spoken-languages', 'Spoken Languages');
  });

  it('displays category descriptions', async () => {
    render(<CategorySelector onSelectCategory={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Learn various spoken languages')).toBeInTheDocument();
    });
  });

  it('shows subcategory previews', async () => {
    render(<CategorySelector onSelectCategory={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/french/i)).toBeInTheDocument();
      expect(screen.getByText(/spanish/i)).toBeInTheDocument();
    });
  });

  it('handles empty categories', async () => {
    (dataLoader.loadCategories as any).mockResolvedValue({});
    render(<CategorySelector onSelectCategory={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/no categories/i)).toBeInTheDocument();
    });
  });
});

describe('SubcategorySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (dataLoader.loadSubcategories as any).mockResolvedValue(mockSubcategories);
  });

  it('renders loading state initially', () => {
    render(
      <SubcategorySelector
        categoryId="spoken-languages"
        categoryName="Spoken Languages"
        onSelectSubcategory={vi.fn()}
      />
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('loads and displays subcategories', async () => {
    render(
      <SubcategorySelector
        categoryId="spoken-languages"
        categoryName="Spoken Languages"
        onSelectSubcategory={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('French')).toBeInTheDocument();
      expect(screen.getByText('Spanish')).toBeInTheDocument();
    });

    expect(dataLoader.loadSubcategories).toHaveBeenCalledWith('spoken-languages');
  });

  it('calls callback when subcategory is selected', async () => {
    const handleSelect = vi.fn();
    render(
      <SubcategorySelector
        categoryId="spoken-languages"
        categoryName="Spoken Languages"
        onSelectSubcategory={handleSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('French')).toBeInTheDocument();
    });

    const subcategoryButton = screen.getByText('French');
    fireEvent.click(subcategoryButton);

    expect(handleSelect).toHaveBeenCalledWith('french');
  });

  it('displays back button when onBack prop is provided', async () => {
    const handleBack = vi.fn();
    render(
      <SubcategorySelector
        categoryId="spoken-languages"
        categoryName="Spoken Languages"
        onSelectSubcategory={vi.fn()}
        onBack={handleBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('French')).toBeInTheDocument();
    });

    const backButton = screen.getAllByRole('button').find((btn) =>
      btn.querySelector('svg')
    );
    if (backButton) {
      fireEvent.click(backButton);
      expect(handleBack).toHaveBeenCalled();
    }
  });

  it('shows category name in breadcrumb', async () => {
    render(
      <SubcategorySelector
        categoryId="spoken-languages"
        categoryName="Spoken Languages"
        onSelectSubcategory={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spoken Languages')).toBeInTheDocument();
    });
  });

  it('handles empty subcategories', async () => {
    (dataLoader.loadSubcategories as any).mockResolvedValue([]);
    render(
      <SubcategorySelector
        categoryId="spoken-languages"
        categoryName="Spoken Languages"
        onSelectSubcategory={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/no subcategories/i)).toBeInTheDocument();
    });
  });
});

describe('TopicGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (dataLoader.loadTopics as any).mockResolvedValue(mockTopics);
  });

  it('renders loading state initially', () => {
    render(
      <TopicGrid
        categoryId="spoken-languages"
        subcategoryId="french"
        categoryName="Spoken Languages"
        subcategoryName="French"
        onSelectTopic={vi.fn()}
      />
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('loads and displays topics', async () => {
    render(
      <TopicGrid
        categoryId="spoken-languages"
        subcategoryId="french"
        categoryName="Spoken Languages"
        subcategoryName="French"
        onSelectTopic={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/numbers/i)).toBeInTheDocument();
      expect(screen.getByText(/fruits/i)).toBeInTheDocument();
      expect(screen.getByText(/vegetables/i)).toBeInTheDocument();
    });

    expect(dataLoader.loadTopics).toHaveBeenCalledWith(
      'spoken-languages',
      'french'
    );
  });

  it('calls callback when topic is selected', async () => {
    const handleSelect = vi.fn();
    render(
      <TopicGrid
        categoryId="spoken-languages"
        subcategoryId="french"
        categoryName="Spoken Languages"
        subcategoryName="French"
        onSelectTopic={handleSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/numbers/i)).toBeInTheDocument();
    });

    const topicButton = screen.getByText(/numbers/i);
    fireEvent.click(topicButton);

    expect(handleSelect).toHaveBeenCalledWith('numbers');
  });

  it('displays breadcrumb navigation', async () => {
    render(
      <TopicGrid
        categoryId="spoken-languages"
        subcategoryId="french"
        categoryName="Spoken Languages"
        subcategoryName="French"
        onSelectTopic={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/spoken languages/i)).toBeInTheDocument();
      expect(screen.getByText(/french/i)).toBeInTheDocument();
    });
  });

  it('handles empty topics', async () => {
    (dataLoader.loadTopics as any).mockResolvedValue([]);
    render(
      <TopicGrid
        categoryId="spoken-languages"
        subcategoryId="french"
        categoryName="Spoken Languages"
        subcategoryName="French"
        onSelectTopic={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/no topics/i)).toBeInTheDocument();
    });
  });

  it('displays back button when onBack prop is provided', async () => {
    const handleBack = vi.fn();
    render(
      <TopicGrid
        categoryId="spoken-languages"
        subcategoryId="french"
        categoryName="Spoken Languages"
        subcategoryName="French"
        onSelectTopic={vi.fn()}
        onBack={handleBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/numbers/i)).toBeInTheDocument();
    });

    const backButton = screen.getAllByRole('button').find((btn) =>
      btn.querySelector('svg')
    );
    if (backButton) {
      fireEvent.click(backButton);
      expect(handleBack).toHaveBeenCalled();
    }
  });
});

describe('TopicIntro', () => {
  it('renders topic name and description', () => {
    render(
      <TopicIntro
        categoryId="spoken-languages"
        subcategoryId="french"
        topicId="numbers"
        topic={mockTopic}
        onStartQuiz={vi.fn()}
      />
    );

    expect(screen.getByText('Numbers')).toBeInTheDocument();
    expect(
      screen.getByText(/choose your difficulty level/i)
    ).toBeInTheDocument();
  });

  it('displays all three difficulty levels', () => {
    render(
      <TopicIntro
        categoryId="spoken-languages"
        subcategoryId="french"
        topicId="numbers"
        topic={mockTopic}
        onStartQuiz={vi.fn()}
      />
    );

    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('displays level descriptions', () => {
    render(
      <TopicIntro
        categoryId="spoken-languages"
        subcategoryId="french"
        topicId="numbers"
        topic={mockTopic}
        onStartQuiz={vi.fn()}
      />
    );

    expect(screen.getByText(/perfect for getting started/i)).toBeInTheDocument();
    expect(screen.getByText(/build on your knowledge/i)).toBeInTheDocument();
    expect(screen.getByText(/master the topic/i)).toBeInTheDocument();
  });

  it('calls onStartQuiz with correct level when clicked', () => {
    const handleStart = vi.fn();
    render(
      <TopicIntro
        categoryId="spoken-languages"
        subcategoryId="french"
        topicId="numbers"
        topic={mockTopic}
        onStartQuiz={handleStart}
      />
    );

    const beginnerButton = screen.getByText('Beginner');
    fireEvent.click(beginnerButton);

    expect(handleStart).toHaveBeenCalledWith('easy');
  });

  it('displays topic statistics', () => {
    render(
      <TopicIntro
        categoryId="spoken-languages"
        subcategoryId="french"
        topicId="numbers"
        topic={mockTopic}
        onStartQuiz={vi.fn()}
      />
    );

    expect(screen.getByText('90')).toBeInTheDocument(); // Total questions
    expect(screen.getByText('3')).toBeInTheDocument(); // Difficulty levels
    expect(screen.getByText('30')).toBeInTheDocument(); // Per level
  });

  it('displays learning tips', () => {
    render(
      <TopicIntro
        categoryId="spoken-languages"
        subcategoryId="french"
        topicId="numbers"
        topic={mockTopic}
        onStartQuiz={vi.fn()}
      />
    );

    expect(screen.getByText(/start with the beginner/i)).toBeInTheDocument();
    expect(screen.getByText(/70%/)).toBeInTheDocument();
    expect(screen.getByText(/review wrong answers/i)).toBeInTheDocument();
  });

  it('displays back button when onBack prop is provided', () => {
    const handleBack = vi.fn();
    render(
      <TopicIntro
        categoryId="spoken-languages"
        subcategoryId="french"
        topicId="numbers"
        topic={mockTopic}
        onStartQuiz={vi.fn()}
        onBack={handleBack}
      />
    );

    const backButton = screen.getAllByRole('button').find((btn) =>
      btn.querySelector('svg')
    );
    if (backButton) {
      fireEvent.click(backButton);
      expect(handleBack).toHaveBeenCalled();
    }
  });

  it('handles different level selections', () => {
    const handleStart = vi.fn();
    render(
      <TopicIntro
        categoryId="spoken-languages"
        subcategoryId="french"
        topicId="numbers"
        topic={mockTopic}
        onStartQuiz={handleStart}
      />
    );

    fireEvent.click(screen.getByText('Beginner'));
    expect(handleStart).toHaveBeenCalledWith('easy');

    handleStart.mockClear();

    fireEvent.click(screen.getByText('Intermediate'));
    expect(handleStart).toHaveBeenCalledWith('medium');

    handleStart.mockClear();

    fireEvent.click(screen.getByText('Advanced'));
    expect(handleStart).toHaveBeenCalledWith('hard');
  });
});
