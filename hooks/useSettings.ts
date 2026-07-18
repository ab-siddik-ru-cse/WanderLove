'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IApiResponse, IUserPreferences } from '@/types';

export function useSettings() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const savePreferences = useCallback(
    async (partial: Partial<IUserPreferences>) => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partial)
        });
        const json: IApiResponse<IUserPreferences> = await res.json();
        if (!json.success) {
          setError(json.error ?? 'Failed to save');
          return null;
        }
        setSavedAt(Date.now());
        router.refresh(); // re-fetch server components (e.g. ThemeInjector's colors)
        return json.data ?? null;
      } catch {
        setError('Network error. Please try again.');
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [router]
  );

  return { savePreferences, isSaving, error, savedAt };
}
