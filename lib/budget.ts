import { ExpenseSplitRule } from '@/types';
import type { SerializedTrip } from '@/lib/serialize';

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface DayTotal {
  date: string;
  label: string;
  amount: number;
}

export interface SettlementResult {
  hasPartner: boolean;
  totalSpent: number;
  /** Positive = creator is owed money by partner. Negative = creator owes partner. Zero = settled up. */
  netAmount: number;
  creatorPaid: number;
  partnerPaid: number;
  creatorFairShare: number;
  partnerFairShare: number;
  summary: string;
}

/**
 * Flattens every activity across every day into one list, skipping nothing —
 * this runs server-side / with the real numbers, masking for surprises is a
 * pure display concern handled in the UI layer, not here.
 */
function allActivities(trip: SerializedTrip) {
  return trip.days.flatMap((day) => day.activities);
}

export function computeCategoryTotals(trip: SerializedTrip): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const activity of allActivities(trip)) {
    totals.set(activity.category, (totals.get(activity.category) ?? 0) + activity.cost);
  }
  return Array.from(totals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function computeDayTotals(trip: SerializedTrip): DayTotal[] {
  return trip.days.map((day) => ({
    date: day.date,
    label: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: day.activities.reduce((sum, a) => sum + a.cost, 0)
  }));
}

export function computeSettlement(trip: SerializedTrip, partnerId: string | null): SettlementResult {
  const activities = allActivities(trip);
  const totalSpent = activities.reduce((sum, a) => sum + a.cost, 0);

  if (!partnerId) {
    return {
      hasPartner: false,
      totalSpent,
      netAmount: 0,
      creatorPaid: totalSpent,
      partnerPaid: 0,
      creatorFairShare: totalSpent,
      partnerFairShare: 0,
      summary: 'Link a partner to start splitting expenses.'
    };
  }

  let creatorPaid = 0;
  let partnerPaid = 0;
  let creatorFairShare = 0;
  let partnerFairShare = 0;

  for (const activity of activities) {
    const payer = activity.paidBy ?? trip.createdBy; // default assumption: trip creator paid unless specified
    if (payer === partnerId) {
      partnerPaid += activity.cost;
    } else {
      creatorPaid += activity.cost;
    }

    switch (trip.expenseSplitRule) {
      case ExpenseSplitRule.ME:
        creatorFairShare += activity.cost;
        break;
      case ExpenseSplitRule.PARTNER:
        partnerFairShare += activity.cost;
        break;
      case ExpenseSplitRule.HALF:
      default:
        creatorFairShare += activity.cost / 2;
        partnerFairShare += activity.cost / 2;
        break;
    }
  }

  // Positive netAmount: creator overpaid relative to their fair share, so the partner owes the creator.
  const netAmount = creatorPaid - creatorFairShare;

  let summary: string;
  if (Math.abs(netAmount) < 1) {
    summary = "You're all settled up! 💕";
  } else if (netAmount > 0) {
    summary = `Partner owes you ${Math.round(netAmount).toLocaleString()} ${trip.currency}`;
  } else {
    summary = `You owe your partner ${Math.round(Math.abs(netAmount)).toLocaleString()} ${trip.currency}`;
  }

  return { hasPartner: true, totalSpent, netAmount, creatorPaid, partnerPaid, creatorFairShare, partnerFairShare, summary };
}
