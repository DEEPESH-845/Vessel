import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  id?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ children, className, id, ...props }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn('py-20 md:py-24 lg:py-28', className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';
