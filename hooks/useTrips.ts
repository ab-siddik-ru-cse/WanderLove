'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IApiResponse, ITrip, Visibility } from '@/types';

interface CreateTripInput {
  name: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  timezone: string;
  currency: string;
  totalBudget: number;
  visibility: Visibility;
  packingTemplateName?: string;
}

interface InstantPlanInput {
  destination: string;
  days: number;
  totalBudget: number;
  mood: 'romantic' | 'adventure' | 'relax';
}

export function useTrips() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrip = useCallback(
    async (input: CreateTripInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
        const json: IApiResponse<{ tripId: string }> = await res.json();
        if (!json.success || !json.data) {
          setError(json.error ?? 'Failed to create trip');
          return null;
        }
        router.push(`/trips/${json.data.tripId}/itinerary`);
        return json.data.tripId;
      } catch {
        setError('Network error. Please try again.');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const createInstantPlan = useCallback(
    async (input: InstantPlanInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/trips/instant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
        const json: IApiResponse<{ tripId: string }> = await res.json();
        if (!json.success || !json.data) {
          setError(json.error ?? 'Failed to generate instant plan');
          return null;
        }
        router.push(`/trips/${json.data.tripId}/itinerary`);
        return json.data.tripId;
      } catch {
        setError('Network error. Please try again.');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return { createTrip, createInstantPlan, isLoading, error };
}

// ---------- Itinerary-page-scoped helpers (used client-side there) ----------

export async function addActivity(tripId: string, payload: Record<string, unknown>): Promise<IApiResponse<ITrip>> {
  const res = await fetch(`/api/trips/${tripId}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateActivity(
  tripId: string,
  activityId: string,
  payload: Record<string, unknown>
): Promise<IApiResponse<ITrip>> {
  const res = await fetch(`/api/trips/${tripId}/activities/${activityId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteActivity(tripId: string, activityId: string): Promise<IApiResponse<ITrip>> {
  const res = await fetch(`/api/trips/${tripId}/activities/${activityId}`, { method: 'DELETE' });
  return res.json();
}

export async function reorderActivities(
  tripId: string,
  days: { dayId: string; activityIds: string[] }[]
): Promise<IApiResponse<ITrip>> {
  const res = await fetch(`/api/trips/${tripId}/activities/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days })
  });
  return res.json();
}
