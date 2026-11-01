import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Hook to handle trailing slash redirects using React Router
 * Redirects URLs without trailing slashes to URLs with trailing slashes
 * Allows accessing the app with both /learn and /learn/
 */
export function useTrailingSlashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const pathname = window.location.pathname;
    
    // If pathname doesn't end with / and isn't just /, redirect with trailing slash
    if (pathname !== '/' && !pathname.endsWith('/')) {
      // Use router navigation instead of full page reload
      navigate(pathname + '/', { replace: true });
    }
  }, [navigate]);
}

