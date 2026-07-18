'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IApiResponse, IPublicUser, ILoginInput, IRegisterInput } from '@/types';

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (input: ILoginInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
        const json: IApiResponse<IPublicUser> = await res.json();
        if (!json.success) {
          setError(json.error ?? 'Login failed');
          return false;
        }
        router.push('/');
        router.refresh();
        return true;
      } catch {
        setError('Network error. Please try again.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (input: IRegisterInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
        const json: IApiResponse<IPublicUser> = await res.json();
        if (!json.success) {
          setError(json.error ?? 'Registration failed');
          return false;
        }
        router.push('/');
        router.refresh();
        return true;
      } catch {
        setError('Network error. Please try again.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }, [router]);

  return { login, register, logout, isLoading, error };
}
