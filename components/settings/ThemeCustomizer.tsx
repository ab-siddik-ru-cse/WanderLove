'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';
import { hexToRgbTriplet, shadeHex } from '@/lib/color';
import type { IThemePreference } from '@/types';

interface ThemeCustomizerProps {
  initialTheme: IThemePreference;
}

function applyLivePreview(primary: string, secondary: string) {
  const root = document.documentElement;
  const apply = (name: string, hex: string) => {
    root.style.setProperty(`--color-${name}`, hex);
    root.style.setProperty(`--color-${name}-rgb`, hexToRgbTriplet(hex));
  };
  apply('primary', primary);
  apply('primary-light', shadeHex(primary, 35));
  apply('primary-dark', shadeHex(primary, -25));
  apply('secondary', secondary);
  apply('secondary-light', shadeHex(secondary, 35));
  apply('secondary-dark', shadeHex(secondary, -25));
}

export function ThemeCustomizer({ initialTheme }: ThemeCustomizerProps) {
  const { savePreferences, isSaving, error, savedAt } = useSettings();
  const [primary, setPrimary] = useState(initialTheme.primary);
  const [secondary, setSecondary] = useState(initialTheme.secondary);

  const handleChange = (which: 'primary' | 'secondary', value: string) => {
    if (which === 'primary') setPrimary(value);
    else setSecondary(value);
    applyLivePreview(which === 'primary' ? value : primary, which === 'secondary' ? value : secondary);
  };

  const handleSave = () => {
    void savePreferences({ theme: { ...initialTheme, primary, secondary } });
  };

  return (
    <div className="card-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="font-heading text-lg font-semibold">Theme customizer</h3>
      </div>
      <p className="mb-4 text-sm text-ink/50">Pick your couple&apos;s colors — changes preview instantly across the whole app.</p>

      <div className="grid grid-cols-2 gap-6">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink/70">Primary color</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primary}
              onChange={(e) => handleChange('primary', e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-ink/10"
            />
            <span className="font-mono text-sm text-ink/60">{primary}</span>
          </div>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink/70">Secondary color</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={secondary}
              onChange={(e) => handleChange('secondary', e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-ink/10"
            />
            <span className="font-mono text-sm text-ink/60">{secondary}</span>
          </div>
        </label>
      </div>

      <div className="mt-4 h-12 rounded-xl bg-love-gradient" />

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleSave} isLoading={isSaving} className="!px-4 !py-2 text-sm">
          Save theme
        </Button>
        {savedAt && <span className="text-xs text-ink/40">Saved ✓</span>}
      </div>
    </div>
  );
}
