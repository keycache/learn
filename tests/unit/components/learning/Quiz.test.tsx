import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuestionCard } from '@/components/learning/QuestionCard';
import { Quiz } from '@/components/learning/Quiz';
import { Question, QuestionProgress } from '@/types/learning';

// Mock data
const mockQuestion: Question = {
  id: 'q-easy-00',
  text: 'What is 1 + 1?',
  options: [
    { id: 'opt-easy-00-a', text: '2' },
    { id: 'opt-easy-00-b', text: '3' },
    { id: 'opt-easy-00-c', text: '4' },
    { id: 'opt-easy-00-d', text: '5' },
  ],
  correctAnswers: ['opt-easy-00-a'],
  explanation: 'One plus one equals two.',
};

const mockMultipleChoiceQuestion: Question = {
  id: 'q-easy-01',
  text: 'Select all prime numbers',
  options: [
    { id: 'opt-easy-01-a', text: '2' },
    { id: 'opt-easy-01-b', text: '4' },
    { id: 'opt-easy-01-c', text: '5' },
    { id: 'opt-easy-01-d', text: '6' },
  ],
  correctAnswers: ['opt-easy-01-a', 'opt-easy-01-c'],
  explanation: '2 and 5 are prime numbers.',
};

describe('QuestionCard', () => {
  it('renders a question with options', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswers={[]}
        onSelectAnswer={handleSelect}
      />
    );

    expect(screen.getByText('What is 1 + 1?')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders radio buttons for single choice questions', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswers={[]}
        onSelectAnswer={handleSelect}
      />
    );

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(4);
  });

  it('renders checkboxes for multiple choice questions', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCard
        question={mockMultipleChoiceQuestion}
        selectedAnswers={[]}
        onSelectAnswer={handleSelect}
      />
    );

    expect(screen.getByText('(Select all that apply)')).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
  });

  it('calls onSelectAnswer when an option is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswers={[]}
        onSelectAnswer={handleSelect}
      />
    );

    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    expect(handleSelect).toHaveBeenCalledWith('opt-easy-00-a', false);
  });

  it('shows selected answer', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswers={['opt-easy-00-a']}
        onSelectAnswer={handleSelect}
      />
    );

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons[0]).toBeChecked();
  });

  it('displays progress information when provided', () => {
    const handleSelect = vi.fn();
    const progress: QuestionProgress = { attempts: 2, wrong: 1 };

    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswers={[]}
        onSelectAnswer={handleSelect}
        progress={progress}
      />
    );

    expect(screen.getByText(/Attempts: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Correct: 1/)).toBeInTheDocument();
  });

  it('toggles checkbox selection for multiple choice questions', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCard
        question={mockMultipleChoiceQuestion}
        selectedAnswers={[]}
        onSelectAnswer={handleSelect}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(handleSelect).toHaveBeenCalledWith('opt-easy-01-a', true);
  });

  it('shows multiple selected answers', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionCard
        question={mockMultipleChoiceQuestion}
        selectedAnswers={['opt-easy-01-a', 'opt-easy-01-c']}
        onSelectAnswer={handleSelect}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[2]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });
});

describe('Quiz', () => {
  const mockQuestions: Question[] = [mockQuestion, mockMultipleChoiceQuestion];

  it('renders first question', () => {
    render(
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        questions={mockQuestions}
      />
    );

    expect(screen.getByText('Numbers')).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 2/)).toBeInTheDocument();
    expect(screen.getByText('What is 1 + 1?')).toBeInTheDocument();
  });

  it('displays progress information', () => {
    render(
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        questions={mockQuestions}
      />
    );

    expect(screen.getByText(/Question 1 of 2/)).toBeInTheDocument();
  });

  it('enables next button only on last question', () => {
    render(
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        questions={mockQuestions}
      />
    );

    let nextButton = screen.getByRole('button', { name: /Next/ });
    expect(nextButton).not.toBeDisabled();
  });

  it('disables submit button when no answer selected', () => {
    render(
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        questions={mockQuestions}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Submit Answer/ });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when answer is selected', () => {
    render(
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        questions={mockQuestions}
      />
    );

    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    const submitButton = screen.getByRole('button', { name: /Submit Answer/ });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows explanation after submission', async () => {
    render(
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        questions={mockQuestions}
      />
    );

    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    const submitButton = screen.getByRole('button', { name: /Submit Answer/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Explanation:/)).toBeInTheDocument();
      expect(screen.getByText('One plus one equals two.')).toBeInTheDocument();
    });
  });

  it('calls onComplete with results on last question submission', async () => {
    const handleComplete = vi.fn();

    const singleQuestion = [mockQuestion];
    render(
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        questions={singleQuestion}
        onComplete={handleComplete}
      />
    );

    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    const submitButton = screen.getByRole('button', { name: /Submit Answer/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Finish Quiz/ })).toBeInTheDocument();
    });

    const finishButton = screen.getByRole('button', { name: /Finish Quiz/ });
    fireEvent.click(finishButton);

    expect(handleComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 1,
        total: 1,
        percentage: 100,
      })
    );
  });

  it('correctly scores multiple choice question', async () => {
    const handleComplete = vi.fn();
    const singleQuestion = [mockMultipleChoiceQuestion];

    render(
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        questions={singleQuestion}
        onComplete={handleComplete}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // opt-easy-01-a (correct)
    fireEvent.click(checkboxes[2]); // opt-easy-01-c (correct)

    const submitButton = screen.getByRole('button', { name: /Submit Answer/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Finish Quiz/ })).toBeInTheDocument();
    });

    const finishButton = screen.getByRole('button', { name: /Finish Quiz/ });
    fireEvent.click(finishButton);

    expect(handleComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 1,
        total: 1,
        percentage: 100,
      })
    );
  });

  it('correctly scores incorrect answer', async () => {
    const handleComplete = vi.fn();
    const singleQuestion = [mockQuestion];

    render(
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        questions={singleQuestion}
        onComplete={handleComplete}
      />
    );

    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[1]); // Wrong answer

    const submitButton = screen.getByRole('button', { name: /Submit Answer/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Finish Quiz/ })).toBeInTheDocument();
    });

    const finishButton = screen.getByRole('button', { name: /Finish Quiz/ });
    fireEvent.click(finishButton);

    expect(handleComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 0,
        total: 1,
        percentage: 0,
      })
    );
  });

  it('shows level in header', () => {
    render(
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="medium"
        questions={mockQuestions}
      />
    );

    expect(screen.getByText(/Level: medium/)).toBeInTheDocument();
  });

  it('navigates between questions', async () => {
    render(
      <Quiz
        category="spoken-languages"
        subcategory="french"
        topic="numbers"
        level="easy"
        questions={mockQuestions}
      />
    );

    expect(screen.getByText('What is 1 + 1?')).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 2/)).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /Next/ });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Question 2 of 2/)).toBeInTheDocument();
    });

    expect(screen.getByText('Select all prime numbers')).toBeInTheDocument();
  });
});
