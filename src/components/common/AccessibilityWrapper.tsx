import { useEffect, useRef } from 'react';

interface AccessibilityProps {
  children: React.ReactNode;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  focusTrapEnabled?: boolean;
}

export function AccessibilityWrapper({
  children,
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  focusTrapEnabled = false,
}: AccessibilityProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusTrapEnabled && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }

        if (event.key === 'Escape') {
          const closeButton = containerRef.current?.querySelector('[data-close-button]') as HTMLElement;
          closeButton?.click();
        }
      };

      containerRef.current.addEventListener('keydown', handleKeyDown);

      return () => {
        containerRef.current?.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [focusTrapEnabled]);

  return (
    <div
      ref={containerRef}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </div>
  );
}
