'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { cn } from '@/lib/utils';

export function ThemeModeToggle({ className }: { className?: string }) {
  const { mode, toggle } = useThemeMode();

  return (
    <button
      onClick={toggle}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl text-ink/60 transition-colors hover:bg-blush hover:text-ink',
        className
      )}
    >
      {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
