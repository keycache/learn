import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  animationType?: 'fade' | 'slideUp' | 'slideDown';
  className?: string;
}

export function PageTransition({
  children,
  animationType = 'slideUp',
  className = '',
}: PageTransitionProps) {
  const animationClass = {
    fade: 'fade-in',
    slideUp: 'slide-in-bottom',
    slideDown: 'slide-in-top',
  }[animationType];

  return (
    <div className={`${animationClass} ${className}`}>
      {children}
    </div>
  );
}
