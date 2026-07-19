import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink/70">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn('input-field', error && 'ring-2 ring-red-400/60', className)}
          {...props}
        />
        {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
