import React, { ReactNode, forwardRef, ElementType } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, as: Component = 'div', ...props }, ref) => {
    return React.createElement(
      Component,
      { ref, className: cn('max-w-7xl mx-auto px-6 md:px-10', className), ...props },
      children
    );
  }
);

Container.displayName = 'Container';
