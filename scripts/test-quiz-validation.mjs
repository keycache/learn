import fs from 'fs';
import { GeneratedQuizSchema } from './src/schemas/quiz.schema.ts';

const quiz = JSON.parse(fs.readFileSync('src/data/categories/spoken-languages/french/numbers/quiz.json', 'utf8'));

console.log('🧪 Testing quiz.json against GeneratedQuizSchema...\n');

try {
  const result = GeneratedQuizSchema.safeParse(quiz);
  
  if (result.success) {
    console.log('✅ VALIDATION PASSED!\n');
    const validated = result.data;
    console.log(`Title: ${validated.title}`);
    console.log(`Lesson ID: ${validated.lesson_id}`);
    console.log(`Version: ${validated.quiz_version}`);
    console.log(`Total Questions: ${validated.metadata.totalQuestions}`);
    console.log(`\nAll questions are valid per schema ✓`);
  } else {
    console.log('❌ VALIDATION FAILED\n');
    console.log('Errors:');
    result.error.errors.forEach((e, i) => {
      console.log(`${i + 1}. ${e.path.join('.')}: ${e.message}`);
    });
  }
} catch (e) {
  console.error('❌ Error during validation:', e.message);
}
