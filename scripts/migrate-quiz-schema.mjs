/**
 * Migrate quiz.json from old format to GeneratedQuizSchema format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const quizPath = path.join(__dirname, '../src/data/categories/spoken-languages/french/numbers/quiz.json');

console.log('📖 Reading old quiz.json...');
const oldQuiz = JSON.parse(fs.readFileSync(quizPath, 'utf8'));

console.log(`Found quiz: "${oldQuiz.name}"`);
console.log(`Structure: ${Object.keys(oldQuiz.levels).join(', ')}`);

// Count questions
const questionCounts = {};
for (const [difficulty, level] of Object.entries(oldQuiz.levels)) {
  questionCounts[difficulty] = level.questions.length;
}
console.log(`Questions: Easy=${questionCounts.easy}, Medium=${questionCounts.medium}, Hard=${questionCounts.hard}`);

// Transform to new schema
const newQuiz = {
  title: `${oldQuiz.name} Quiz`,
  lesson_id: `${oldQuiz.subcategory}/${oldQuiz.name.toLowerCase()}`,
  quiz_version: 1,
  questions: [],
  metadata: {
    totalQuestions: 0,
    createdAt: new Date().toISOString(),
    lessonId: `${oldQuiz.subcategory}/${oldQuiz.name.toLowerCase()}`
  }
};

// Process each difficulty level
let questionId = 1;
for (const [difficulty, level] of Object.entries(oldQuiz.levels)) {
  for (const oldQuestion of level.questions) {
    // Determine question type
    let type = 'multiple-choice';
    if (oldQuestion.options.length === 2) {
      type = 'true-false';
    }

    // Convert options from objects to strings
    const optionTexts = oldQuestion.options.map(opt => opt.text);

    // Get correct answer - find the text of the correct option ID
    const correctOptionId = oldQuestion.correctAnswers[0];
    const correctOptionObj = oldQuestion.options.find(opt => opt.id === correctOptionId);
    const correctAnswer = correctOptionObj ? correctOptionObj.text : optionTexts[0];

    const newQuestion = {
      id: oldQuestion.id || `q${questionId}`,
      type: type,
      question: oldQuestion.text,
      options: optionTexts,
      correctAnswer: correctAnswer,
      explanation: oldQuestion.explanation || '',
      difficulty: difficulty,
      points: 1
    };

    newQuiz.questions.push(newQuestion);
    questionId++;
  }
}

newQuiz.metadata.totalQuestions = newQuiz.questions.length;

// Backup old file
const backupPath = quizPath.replace('.json', '.backup.json');
console.log(`\n💾 Backing up old file to: ${path.basename(backupPath)}`);
fs.copyFileSync(quizPath, backupPath);

// Write new file
console.log(`📝 Writing migrated quiz.json...`);
fs.writeFileSync(quizPath, JSON.stringify(newQuiz, null, 2), 'utf8');

console.log(`\n✅ Migration complete!`);
console.log(`   Total questions: ${newQuiz.metadata.totalQuestions}`);
console.log(`   Structure: Flat questions[] array (was: nested levels)`);
console.log(`   Added: type, difficulty, points per question`);
console.log(`   Added: quiz_version, metadata object`);
console.log(`   Options converted: objects → strings`);
console.log(`   Backup saved: ${path.basename(backupPath)}`);

// Validate structure
console.log(`\n🔍 Validating new structure...`);
const sample = newQuiz.questions[0];
console.log(`Sample question:`, JSON.stringify(sample, null, 2));

