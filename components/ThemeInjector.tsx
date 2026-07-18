'use client';

import { useEffect } from 'react';
import { hexToRgbTriplet, shadeHex } from '@/lib/color';

interface ThemeInjectorProps {
  primary: string;
  secondary: string;
}

// Applies the couple's custom colors at runtime by overriding the CSS
// variables defined in globals.css. Light/dark variants are derived
// automatically so every component (buttons, badges, gradients) that
// references --color-primary-light/-dark stays in sync without the
// person having to pick 6 separate colors.
export function ThemeInjector({ primary, secondary }: ThemeInjectorProps) {
  useEffect(() => {
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
  }, [primary, secondary]);

  return null;
}
