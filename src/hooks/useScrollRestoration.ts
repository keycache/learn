import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to restore scroll position when navigating
 * Scrolls to top on route change
 * 
 * Can be extended to restore scroll position based on previous routes
 */
export function useScrollRestoration() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on every route change
    window.scrollTo(0, 0);
  }, [location.pathname]);
}
