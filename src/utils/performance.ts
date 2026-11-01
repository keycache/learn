import { useMemo, useCallback, useEffect, useRef } from 'react';

/**
 * Hook to debounce a function call
 * Useful for expensive operations that happen frequently (e.g., search, resize)
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Hook to throttle a function call
 * Useful for scroll events, window resize, etc.
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = delay - (now - lastRunRef.current);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (remaining <= 0) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callback(...args);
        }, remaining);
      }
    },
    [callback, delay]
  );
}

/**
 * Hook to lazy load components
 * Improves initial page load by splitting code
 */
export function useLazyLoad(
  callback: () => Promise<void>,
  triggerOn: boolean = true
) {
  useEffect(() => {
    if (triggerOn) {
      callback();
    }
  }, [triggerOn, callback]);
}

/**
 * Memoize expensive calculations
 * Prevents unnecessary re-renders
 */
export function useMemoComputation<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * Virtual scrolling support for large lists
 * Reduces DOM nodes rendered for better performance
 */
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  items: any[];
  overscan?: number;
}

export function useVirtualScroll({
  itemHeight,
  containerHeight,
  items,
  overscan = 3,
}: VirtualScrollConfig) {
  const scrollTopRef = useRef<number>(0);
  const visibleRangeRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newScrollTop = target.scrollTop;
    scrollTopRef.current = newScrollTop;

    const visibleStart = Math.floor(newScrollTop / itemHeight);
    const visibleEnd = Math.ceil((newScrollTop + containerHeight) / itemHeight);

    const rangeStart = Math.max(0, visibleStart - overscan);
    const rangeEnd = Math.min(items.length, visibleEnd + overscan);

    visibleRangeRef.current = { start: rangeStart, end: rangeEnd };
  }, [itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(
    () => items.slice(visibleRangeRef.current.start, visibleRangeRef.current.end),
    [items]
  );

  const offsetY = visibleRangeRef.current.start * itemHeight;

  return {
    visibleItems,
    offsetY,
    handleScroll,
  };
}

/**
 * Cache API responses to reduce network requests
 */
const cache = new Map<string, { data: any; timestamp: number }>();

export function getCachedData<T>(
  key: string,
  ttl: number = 5 * 60 * 1000 // 5 minutes
): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > ttl;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCache(): void {
  cache.clear();
}

/**
 * Performance monitoring utility
 * Tracks component render times and metrics
 */
export function usePerformanceMetrics(componentName: string) {
  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    renderStartRef.current = performance.now();

    return () => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStartRef.current;

      // Log only in development mode
      if (typeof window !== 'undefined' && (window as any).__DEV__) {
        console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}
