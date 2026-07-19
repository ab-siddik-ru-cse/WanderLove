'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'wanderlove-theme-mode';

function getInitialMode(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function useThemeMode() {
  // Read the class the blocking <head> script already applied, so there's
  // no mismatch/flash between this hook's initial state and the DOM.
  const [mode, setMode] = useState<'light' | 'dark'>(getInitialMode);

  useEffect(() => {
    setMode(getInitialMode());
  }, []);

  const applyMode = useCallback((next: 'light' | 'dark') => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem(STORAGE_KEY, next);
    setMode(next);
  }, []);

  const toggle = useCallback(() => {
    applyMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, applyMode]);

  return { mode, toggle, setMode: applyMode };
}
