/**
 * Validate migrated quiz.json against GeneratedQuizSchema
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GeneratedQuizSchema } from './src/schemas/quiz.schema.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const quizPath = path.join(__dirname, './src/data/categories/spoken-languages/french/numbers/quiz.json');

console.log('📖 Reading migrated quiz.json...');
const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8'));

console.log('\n🔍 Validating against GeneratedQuizSchema...');

try {
  const validated = GeneratedQuizSchema.parse(quiz);
  console.log('\n✅ VALIDATION PASSED!\n');
  console.log(`✓ Title: ${validated.title}`);
  console.log(`✓ Lesson ID: ${validated.lesson_id}`);
  console.log(`✓ Quiz Version: ${validated.quiz_version}`);
  console.log(`✓ Total Questions: ${validated.metadata.totalQuestions}`);
  console.log(`✓ Created: ${validated.metadata.createdAt}`);
  console.log(`✓ Sample Question Type: ${validated.questions[0].type}`);
  console.log(`✓ Sample Difficulty: ${validated.questions[0].difficulty}`);
  console.log(`✓ Sample Points: ${validated.questions[0].points}`);
  
  // Count by difficulty
  const diffCount = { easy: 0, medium: 0, hard: 0 };
  for (const q of validated.questions) {
    diffCount[q.difficulty]++;
  }
  console.log(`\n📊 Distribution:`);
  console.log(`   Easy: ${diffCount.easy}`);
  console.log(`   Medium: ${diffCount.medium}`);
  console.log(`   Hard: ${diffCount.hard}`);
  
} catch (error) {
  console.error('\n❌ VALIDATION FAILED!');
  console.error(error.errors ? error.errors[0] : error.message);
  process.exit(1);
}

