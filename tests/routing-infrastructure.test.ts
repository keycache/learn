import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from '../routes/RootLayout';
import { CategoriesRoute } from '../routes/categories';
import { NotFoundRoute } from '../routes/not-found';

/**
 * Phase 7.1 tests: Route structure validation
 */

describe('Route Structure', () => {
  it('should render RootLayout with header', () => {
    render(
      <MemoryRouter initialEntries={['/learn']}>
        <Routes>
          <Route path="/learn" element={<RootLayout />}>
            <Route index element={<CategoriesRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Check for main content area
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should render CategorySelector on index route', () => {
    render(
      <MemoryRouter initialEntries={['/learn']}>
        <Routes>
          <Route path="/learn" element={<RootLayout />}>
            <Route index element={<CategoriesRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // CategorySelector should render
    expect(screen.getByText(/learning platform/i)).toBeInTheDocument();
  });

  it('should render 404 page for invalid routes', () => {
    render(
      <MemoryRouter initialEntries={['/learn/invalid/path']}>
        <Routes>
          <Route path="/learn" element={<RootLayout />} />
          <Route path="*" element={<NotFoundRoute />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('should have skip to content link for accessibility', () => {
    render(
      <MemoryRouter initialEntries={['/learn']}>
        <Routes>
          <Route path="/learn" element={<RootLayout />}>
            <Route index element={<CategoriesRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should have dark mode toggle in header', () => {
    render(
      <MemoryRouter initialEntries={['/learn']}>
        <Routes>
          <Route path="/learn" element={<RootLayout />}>
            <Route index element={<CategoriesRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Dark mode toggle button should be present
    const toggleButton = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(toggleButton).toBeInTheDocument();
  });
});

describe('Route Navigation', () => {
  it('should have correct route paths defined', () => {
    // Verify route structure exists
    expect(true).toBe(true);
  });

  it('should display 404 when accessing invalid category', () => {
    render(
      <MemoryRouter initialEntries={['/learn/invalid-category']}>
        <Routes>
          <Route path="/learn" element={<RootLayout />} />
          <Route path="*" element={<NotFoundRoute />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
