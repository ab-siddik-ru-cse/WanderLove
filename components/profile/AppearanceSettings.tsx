'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useThemeMode } from '@/hooks/useThemeMode';
import { cn } from '@/lib/utils';

export function AppearanceSettings() {
  const { mode, setMode } = useThemeMode();

  const options = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon }
  ];

  return (
    <Card>
      <h2 className="mb-1 font-heading text-lg font-semibold">Appearance</h2>
      <p className="mb-4 text-sm text-ink/50">Choose how WanderLove looks on this device.</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border-2 py-4 transition-colors',
              mode === value ? 'border-primary bg-blush text-primary-dark' : 'border-ink/10 text-ink/50 hover:border-primary/40'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/40">
        <Monitor className="h-3.5 w-3.5" />
        Saved on this device — each of you can pick your own.
      </p>
    </Card>
  );
}
