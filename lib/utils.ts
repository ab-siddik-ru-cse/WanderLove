import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Human-friendly partner link codes, e.g. "LOVE-7XQ2"
const nanoidAlphabet = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 4);
export function generatePartnerCode(): string {
  return `LOVE-${nanoidAlphabet()}`;
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function getDaysBetween(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);

  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function getCountdownParts(target: Date): { days: number; hours: number; minutes: number; isPast: boolean } {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  return { days, hours, minutes, isPast: false };
}
