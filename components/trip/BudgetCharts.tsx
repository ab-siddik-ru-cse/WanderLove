'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Heart, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CategoryTotal, DayTotal, SettlementResult } from '@/lib/budget';

interface BudgetChartsProps {
  currency: string;
  totalBudget: number;
  categoryTotals: CategoryTotal[];
  dayTotals: DayTotal[];
  settlement: SettlementResult;
  partnerName?: string | null;
}

const PIE_COLORS = ['#E85D75', '#6C63FF', '#F7A4B5', '#A29BFE', '#B23A54', '#4834D4', '#FFD166', '#06D6A0'];

export function BudgetCharts({ currency, totalBudget, categoryTotals, dayTotals, settlement, partnerName }: BudgetChartsProps) {
  const remaining = totalBudget - settlement.totalSpent;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-surface p-5">
          <p className="text-xs uppercase tracking-wide text-ink/40">Total budget</p>
          <p className="mt-1 font-heading text-xl font-bold">{formatCurrency(totalBudget, currency)}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-xs uppercase tracking-wide text-ink/40">Spent so far</p>
          <p className="mt-1 font-heading text-xl font-bold text-primary-dark">{formatCurrency(settlement.totalSpent, currency)}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-xs uppercase tracking-wide text-ink/40">{remaining >= 0 ? 'Remaining' : 'Over budget'}</p>
          <p className={`mt-1 font-heading text-xl font-bold ${remaining >= 0 ? 'text-ink' : 'text-red-500'}`}>
            {formatCurrency(Math.abs(remaining), currency)}
          </p>
        </div>
      </div>

      <div className="card-surface p-6">
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold">Who owes whom</h3>
        </div>
        {settlement.hasPartner ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-blush p-4">
              <p className="text-xs uppercase tracking-wide text-ink/40">You paid</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(settlement.creatorPaid, currency)}</p>
            </div>
            <div className="rounded-xl bg-blush p-4">
              <p className="text-xs uppercase tracking-wide text-ink/40">{partnerName ?? 'Partner'} paid</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(settlement.partnerPaid, currency)}</p>
            </div>
          </div>
        ) : null}
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-love-gradient p-4 font-medium text-white">
          <Heart className="h-4 w-4 fill-white" /> {settlement.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-surface p-6">
          <h3 className="mb-4 font-heading text-lg font-semibold">Spend by category</h3>
          {categoryTotals.length === 0 ? (
            <p className="text-sm text-ink/40">No expenses logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryTotals} dataKey="amount" nameKey="category" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {categoryTotals.map((entry, index) => (
                    <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-surface p-6">
          <h3 className="mb-4 font-heading text-lg font-semibold">Spend by day</h3>
          {dayTotals.length === 0 ? (
            <p className="text-sm text-ink/40">No days in this trip yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dayTotals}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Bar dataKey="amount" fill="#E85D75" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
