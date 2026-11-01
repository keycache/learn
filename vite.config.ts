import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

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

export default defineConfig({
  base: '/learn/',
  plugins: [trailingSlashPlugin, react(), tailwindcss()],
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

