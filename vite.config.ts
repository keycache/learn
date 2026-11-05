import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitest/config'
import { FileOperations } from './src/services/fileOperations.ts'

// Custom plugin to handle trailing slash redirects
const trailingSlashPlugin = {
  name: 'trailing-slash-redirect',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Redirect /learn to /learn/ (must be before static file handling)
      if (req.url === '/learn' || req.url === '/learn?') {
        res.statusCode = 301;
        res.setHeader('Location', '/learn/');
        res.end();
        return;
      }
      next();
    });
  },
};

// Dev-only API endpoint plugin
const devApiPlugin = {
  name: 'dev-api-endpoints',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // File system API endpoints
      if (req.url.startsWith('/api/dev/fs/')) {
        let body = '';

        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const fileOps = new FileOperations();

            // Query categories
            if (req.url === '/api/dev/fs/categories' && req.method === 'GET') {
              const result = await fileOps.queryFileSystem({ type: 'categories' });
              res.statusCode = result.success ? 200 : 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            // Query subcategories
            if (req.url.startsWith('/api/dev/fs/subcategories/') && req.method === 'GET') {
              const category = req.url.replace('/api/dev/fs/subcategories/', '');
              const result = await fileOps.queryFileSystem({ type: 'subcategories', category });
              res.statusCode = result.success ? 200 : 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            // Query topics
            if (req.url.startsWith('/api/dev/fs/topics/') && req.method === 'GET') {
              const parts = req.url.replace('/api/dev/fs/topics/', '').split('/');
              const category = parts[0];
              const subcategory = parts[1];
              const result = await fileOps.queryFileSystem({ type: 'topics', category, subcategory });
              res.statusCode = result.success ? 200 : 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            // Create category
            if (req.url === '/api/dev/fs/categories' && req.method === 'POST') {
              const data = JSON.parse(body);
              const result = await fileOps.createCategory(data.categoryName);
              res.statusCode = result.success ? 201 : 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            // Create subcategory
            if (req.url === '/api/dev/fs/subcategories' && req.method === 'POST') {
              const data = JSON.parse(body);
              const result = await fileOps.createSubcategory(data.category, data.subcategoryName);
              res.statusCode = result.success ? 201 : 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            // Create topic
            if (req.url === '/api/dev/fs/topics' && req.method === 'POST') {
              const data = JSON.parse(body);
              const result = await fileOps.createTopic(data.category, data.subcategory, data.topicName);
              res.statusCode = result.success ? 201 : 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            // Save lesson file
            if (req.url === '/api/dev/fs/lessons' && req.method === 'POST') {
              const data = JSON.parse(body);
              const { category, subcategory, topic, lesson } = data;
              const topicPath = `${process.cwd()}/src/data/categories/${category}/${subcategory}/${topic}`;
              const result = await fileOps.saveLessonFile(topicPath, lesson);
              res.statusCode = result.success ? 201 : 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            // Save quiz file
            if (req.url === '/api/dev/fs/quizzes' && req.method === 'POST') {
              const data = JSON.parse(body);
              const { category, subcategory, topic, quiz } = data;
              const topicPath = `${process.cwd()}/src/data/categories/${category}/${subcategory}/${topic}`;
              const result = await fileOps.saveQuizFile(topicPath, quiz);
              res.statusCode = result.success ? 201 : 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Not found' }));
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }));
          }
        });

        return;
      }

      // Dev-only: Generate lesson plan and quiz using LLM
      if (req.url === '/api/dev/generate-lesson' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const { topic, difficulty } = data;

            if (!topic) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Topic is required' }));
              return;
            }

            // TODO: Replace with actual LLM call
            // For now, return a mock response structure
            const mockResponse = {
              topic,
              difficulty,
              metadata: {
                generatedAt: new Date().toISOString(),
                generator: 'dev-mode-mock',
              },
              lessons: [
                {
                  id: `lesson-${Math.random().toString(36).substr(2, 9)}`,
                  title: `${topic} - Lesson 1`,
                  description: 'First lesson on the topic',
                  content: '# Lesson Content\n\nThis is a mock lesson generated in dev mode.',
                  duration: '15 minutes',
                },
              ],
              quiz: {
                id: `quiz-${Math.random().toString(36).substr(2, 9)}`,
                title: `${topic} - Quiz`,
                questions: [
                  {
                    id: 'q1',
                    type: 'multiple-choice',
                    question: 'Sample question about ' + topic,
                    options: ['Option A', 'Option B', 'Option C'],
                    correctAnswer: 0,
                  },
                ],
              },
              instructions: 'This is mock data. Replace with actual LLM integration.',
            };

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(mockResponse, null, 2));
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });

        return;
      }

      next();
    });
  },
};

// GitHub Pages serves 404.html for unknown paths; reusing the SPA shell lets
// the router render the app's own 404 page and makes deep-link refreshes work
const spaFallbackPlugin = {
  name: 'spa-404-fallback',
  apply: 'build',
  closeBundle() {
    const outDir = path.resolve(import.meta.dirname, 'dist');
    fs.copyFileSync(path.join(outDir, 'index.html'), path.join(outDir, '404.html'));
  },
};

export default defineConfig({
  base: '/learn/',
  plugins: [trailingSlashPlugin, devApiPlugin, spaFallbackPlugin, react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    globals: true,
  },
})

