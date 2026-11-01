import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { SkipToContentLink } from '@/components/common/SkipToContentLink';
import { useTrailingSlashRedirect } from '@/middleware/trailingSlashRedirect';

/**
 * Root layout component for all routes
 * Provides header, scroll restoration, and outlet for route content
 */
export function RootLayout() {
  const location = useLocation();
  useTrailingSlashRedirect();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <SkipToContentLink />

      {/* Header with Dark Mode Toggle */}
      <header className="fixed top-0 right-0 p-4 z-50 pointer-events-auto">
        <DarkModeToggle />
      </header>

      {/* Main Content */}
      <main id="main-content">
        <Outlet />
      </main>
    </>
  );
}
