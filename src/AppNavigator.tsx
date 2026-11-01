import { useState, useEffect } from 'react';
import { CategorySelector } from '@/components/navigation/CategorySelector';
import { SubcategorySelector } from '@/components/navigation/SubcategorySelector';
import { TopicGrid } from '@/components/navigation/TopicGrid';
import { TopicIntro } from '@/components/navigation/TopicIntro';
import { Quiz } from '@/components/learning/Quiz';
import { ResultsScreen } from '@/components/learning/ResultsScreen';
import { loadTopic, loadLevel } from '@/utils/dataLoader';
import { Question, Topic } from '@/types/learning';

interface QuizResults {
  score: number;
  total: number;
  percentage: number;
  wrongQuestions: string[];
}

type NavigationScreen = 
  | 'categories'
  | 'subcategories'
  | 'topics'
  | 'topic-intro'
  | 'quiz'
  | 'results';

export default function AppNavigator() {
  const [screen, setScreen] = useState<NavigationScreen>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [topicData, setTopicData] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  // Handle category selection
  const handleSelectCategory = (categoryId: string, categoryName: string) => {
    setSelectedCategory(categoryId);
    setSelectedCategoryName(categoryName);
    setSelectedSubcategory('');
    setSelectedTopic('');
    setScreen('subcategories');
  };

  // Handle subcategory selection
  const handleSelectSubcategory = (subcategoryId: string, subcategoryName: string) => {
    setSelectedSubcategory(subcategoryId);
    setSelectedSubcategoryName(subcategoryName);
    setSelectedTopic('');
    setScreen('topics');
  };

  // Handle topic selection
  const handleSelectTopic = async (topicId: string) => {
    setSelectedTopic(topicId);
    setLoading(true);
    const topic = await loadTopic(selectedCategory, selectedSubcategory, topicId);
    if (topic) {
      setTopicData(topic);
    }
    setLoading(false);
    setScreen('topic-intro');
  };

  // Handle difficulty level selection
  const handleStartQuiz = async (level: 'easy' | 'medium' | 'hard') => {
    setSelectedLevel(level);
    setLoading(true);
    const loadedQuestions = await loadLevel(
      selectedCategory,
      selectedSubcategory,
      selectedTopic,
      level
    );
    if (loadedQuestions) {
      setQuestions(loadedQuestions);
    }
    setLoading(false);
    setScreen('quiz');
  };

  // Handle quiz completion
  const handleQuizComplete = (quizResults: QuizResults) => {
    setResults(quizResults);
    setScreen('results');
  };

  // Handle results retry (go back to difficulty selection)
  const handleRetry = () => {
    setResults(null);
    setScreen('topic-intro');
  };

  // Handle back navigation
  const handleBackFromSubcategories = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setScreen('categories');
  };

  const handleBackFromTopics = () => {
    setSelectedTopic('');
    setScreen('subcategories');
  };

  const handleBackFromTopicIntro = () => {
    setTopicData(null);
    setScreen('topics');
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-themed">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Render appropriate screen
  switch (screen) {
    case 'categories':
      return (
        <CategorySelector
          onSelectCategory={handleSelectCategory}
        />
      );

    case 'subcategories':
      return (
        <SubcategorySelector
          categoryId={selectedCategory}
          categoryName={selectedCategoryName}
          onSelectSubcategory={(id) => {
            handleSelectSubcategory(id, id.charAt(0).toUpperCase() + id.slice(1));
          }}
          onBack={handleBackFromSubcategories}
        />
      );

    case 'topics':
      return (
        <TopicGrid
          categoryId={selectedCategory}
          subcategoryId={selectedSubcategory}
          categoryName={selectedCategoryName}
          subcategoryName={selectedSubcategoryName}
          onSelectTopic={handleSelectTopic}
          onBack={handleBackFromTopics}
        />
      );

    case 'topic-intro':
      if (!topicData) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-slate-600 dark:text-slate-400">Topic data not loaded</p>
          </div>
        );
      }
      return (
        <TopicIntro
          categoryId={selectedCategory}
          subcategoryId={selectedSubcategory}
          topicId={selectedTopic}
          topic={topicData}
          onStartQuiz={handleStartQuiz}
          onBack={handleBackFromTopicIntro}
        />
      );

    case 'quiz':
      if (!questions) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-slate-600 dark:text-slate-400">No questions loaded</p>
          </div>
        );
      }
      return (
        <div className="min-h-screen bg-themed p-6">
          <Quiz
            category={selectedCategory}
            subcategory={selectedSubcategory}
            topic={selectedTopic}
            level={selectedLevel}
            questions={questions}
            onComplete={handleQuizComplete}
          />
        </div>
      );

    case 'results':
      if (!results || !questions) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-slate-600 dark:text-slate-400">Results not available</p>
          </div>
        );
      }
      return (
        <ResultsScreen
          category={selectedCategory}
          subcategory={selectedSubcategory}
          topic={selectedTopic}
          level={selectedLevel}
          score={results.score}
          total={results.total}
          wrongQuestionIds={results.wrongQuestions}
          allQuestions={questions}
          onRetry={handleRetry}
        />
      );

    default:
      return null;
  }
}
