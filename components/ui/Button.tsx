'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'inline-flex items-center justify-center gap-2 rounded-xl2 px-4 py-2 text-ink/70 hover:bg-ink/5'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(variantClasses[variant], className)}
        disabled={disabled || isLoading}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
