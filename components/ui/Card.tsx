import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card-surface p-6', className)} {...props}>
      {children}
    </div>
  );
}
