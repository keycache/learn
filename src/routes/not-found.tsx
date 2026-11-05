import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

/**
 * Error page for invalid routes (404)
 */
export function NotFoundRoute() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-themed p-6 flex items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or the URL is invalid.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={() => navigate('/')}>
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
