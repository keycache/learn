import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QuizResultsProvider } from './contexts/QuizResultsContext';
import { routes } from './routes/index';

// Create router with routes configuration
const router = createBrowserRouter(routes, {
  basename: '/learn',
});

export default function App() {
  return (
    <QuizResultsProvider>
      <RouterProvider router={router} />
    </QuizResultsProvider>
  );
}
