// Mongoose `.lean()` documents still contain ObjectId/Date instances,
// which can't be passed from Server Components to Client Components
// as-is. This flattens everything to strings so it's safe to pass down
// and matches the `ITrip` shape used throughout the client.

import type { Mood, Visibility, ExpenseSplitRule } from '@/types';

export interface SerializedActivity {
  _id: string;
  title: string;
  location: string;
  lat?: number;
  lng?: number;
  time: string;
  date: string;
  cost: number;
  currency: string;
  notes?: string;
  image?: string;
  mood?: Mood;
  category: string;
  isSurprise: boolean;
  paidBy?: string;
  customFields: Record<string, string>;
  order: number;
}

export interface SerializedDay {
  _id: string;
  date: string;
  activities: SerializedActivity[];
}

export interface SerializedJournalEntry {
  _id: string;
  authorId: string;
  text: string;
  image?: string;
  createdAt: string;
}

export interface SerializedTrip {
  _id: string;
  name: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  timezone: string;
  currency: string;
  totalBudget: number;
  coverImage?: string;
  visibility: Visibility;
  createdBy: string;
  isInstant: boolean;
  collaborators: string[];
  days: SerializedDay[];
  sharedJournal: SerializedJournalEntry[];
  packingChecklist: { item: string; isPacked: boolean }[];
  expenseSplitRule: ExpenseSplitRule;
  createdAt: string;
  updatedAt: string;
}

function toIdString(value: unknown): string {
  return value && typeof value === 'object' && 'toString' in value ? String(value) : String(value ?? '');
}

export function serializeTrip(trip: any): SerializedTrip {
  return {
    _id: toIdString(trip._id),
    name: trip.name,
    destination: trip.destination,
    country: trip.country,
    startDate: new Date(trip.startDate).toISOString(),
    endDate: new Date(trip.endDate).toISOString(),
    timezone: trip.timezone,
    currency: trip.currency,
    totalBudget: trip.totalBudget,
    coverImage: trip.coverImage,
    visibility: trip.visibility,
    createdBy: toIdString(trip.createdBy),
    isInstant: trip.isInstant,
    collaborators: (trip.collaborators ?? []).map(toIdString),
    days: (trip.days ?? []).map((day: any) => ({
      _id: toIdString(day._id),
      date: new Date(day.date).toISOString(),
      activities: (day.activities ?? [])
        .slice()
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((activity: any) => ({
          _id: toIdString(activity._id),
          title: activity.title,
          location: activity.location,
          lat: activity.lat,
          lng: activity.lng,
          time: activity.time,
          date: new Date(activity.date).toISOString(),
          cost: activity.cost,
          currency: activity.currency,
          notes: activity.notes,
          image: activity.image,
          mood: activity.mood,
          category: activity.category,
          isSurprise: activity.isSurprise,
          paidBy: activity.paidBy ? toIdString(activity.paidBy) : undefined,
          customFields: activity.customFields ?? {},
          order: activity.order ?? 0
        }))
    })),
    sharedJournal: (trip.sharedJournal ?? []).map((entry: any) => ({
      _id: toIdString(entry._id),
      authorId: toIdString(entry.authorId),
      text: entry.text,
      image: entry.image,
      createdAt: new Date(entry.createdAt).toISOString()
    })),
    packingChecklist: trip.packingChecklist ?? [],
    expenseSplitRule: trip.expenseSplitRule,
    createdAt: new Date(trip.createdAt).toISOString(),
    updatedAt: new Date(trip.updatedAt).toISOString()
  };
}
