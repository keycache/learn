import { RouteObject } from 'react-router-dom';
import { lazy, Suspense, ReactNode } from 'react';
import { RootLayout } from './RootLayout';
import { NotFoundRoute } from './not-found';

// Lazy-load route components for code splitting
const CategoriesRoute = lazy(() => import('./categories').then(m => ({ default: m.CategoriesRoute })));
const SubcategoriesRoute = lazy(() => import('./subcategories').then(m => ({ default: m.SubcategoriesRoute })));
const TopicsRoute = lazy(() => import('./topics').then(m => ({ default: m.TopicsRoute })));
const TopicIntroRoute = lazy(() => import('./topic-intro').then(m => ({ default: m.TopicIntroRoute })));
const LessonRoute = lazy(() => import('./lesson').then(m => ({ default: m.LessonRoute })));
const QuizRoute = lazy(() => import('./quiz').then(m => ({ default: m.QuizRoute })));
const ResultsRoute = lazy(() => import('./results').then(m => ({ default: m.ResultsRoute })));

// Dev-only route - completely tree-shaken from production builds
const DevGeneratorRoute = import.meta.env.DEV
  ? lazy(() => import('./dev/index').then(m => ({ default: m.DevGeneratorRoute })))
  : null;

/**
 * Loading fallback component for lazy-loaded routes
 */
function RouteLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-themed">
      <p className="text-muted-foreground animate-pulse-gentle">Loading...</p>
    </div>
  );
}

/**
 * Wrapper to add Suspense boundary around lazy-loaded components
 */
function withSuspense(Component: React.LazyExoticComponent<() => ReactNode>): ReactNode {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Component />
    </Suspense>
  );
}

/**
 * Route configuration for the app
 * All routes are nested under /learn with RootLayout as the root element
 * 
 * Note: Using basename: '/learn' in createBrowserRouter, so paths are relative
 * Route components are lazy-loaded for code splitting and improved performance
 * 
 * URL Structure:
 * /                                          → Categories selector
 * /:category                                 → Subcategories selector
 * /:category/:subcategory                    → Topics grid
 * /:category/:subcategory/:topic             → Topic intro + lessons + quiz selector
 * /:category/:subcategory/:topic/lesson/:id  → Individual lesson view
 * /:category/:subcategory/:topic/quiz        → Quiz (difficulty via ?level=easy|medium|hard)
 * /:category/:subcategory/:topic/results     → Quiz results page
 * /_dev/generator                            → Developer Generator (dev-only, tree-shaken from production)
 * 
 * Dev-only endpoints are available via Vite middleware:
 * POST /api/dev/generate-lesson               → LLM lesson generator (dev-only)
 */
export const routes: RouteObject[] = [
  // Dev-only route - at top level to avoid dynamic route interference
  ...(import.meta.env.DEV && DevGeneratorRoute
    ? [{
        path: '_dev/generator',
        element: withSuspense(DevGeneratorRoute),
      }]
    : []),
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundRoute />,
    children: [
      {
        index: true,
        element: withSuspense(CategoriesRoute),
      },
      {
        path: ':category',
        element: withSuspense(SubcategoriesRoute),
      },
      {
        path: ':category/:subcategory',
        element: withSuspense(TopicsRoute),
      },
      {
        path: ':category/:subcategory/:topic',
        element: withSuspense(TopicIntroRoute),
      },
      {
        path: ':category/:subcategory/:topic/lesson/:lessonId',
        element: withSuspense(LessonRoute),
      },
      {
        path: ':category/:subcategory/:topic/quiz',
        element: withSuspense(QuizRoute),
      },
      {
        path: ':category/:subcategory/:topic/results',
        element: withSuspense(ResultsRoute),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundRoute />,
  },
];
