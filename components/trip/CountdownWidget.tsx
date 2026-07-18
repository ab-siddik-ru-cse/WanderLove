'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCountdownParts } from '@/lib/utils';

interface CountdownWidgetProps {
  targetDate: string; // ISO string
  destination: string;
}

export function CountdownWidget({ targetDate, destination }: CountdownWidgetProps) {
  const [parts, setParts] = useState(() => getCountdownParts(new Date(targetDate)));

  useEffect(() => {
    const interval = setInterval(() => {
      setParts(getCountdownParts(new Date(targetDate)));
    }, 60_000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (parts.isPast) {
    return (
      <div className="rounded-xl2 bg-love-gradient p-6 text-white shadow-soft">
        <p className="text-sm opacity-90">Happening now or already lived 💫</p>
        <p className="mt-1 font-heading text-2xl font-bold">{destination}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl2 bg-love-gradient p-6 text-white shadow-soft"
    >
      <p className="text-sm opacity-90">Countdown to</p>
      <p className="mb-4 font-heading text-2xl font-bold">{destination} 💕</p>
      <div className="flex gap-4">
        {[
          { value: parts.days, label: 'Days' },
          { value: parts.hours, label: 'Hours' },
          { value: parts.minutes, label: 'Mins' }
        ].map(({ value, label }) => (
          <div key={label} className="flex-1 rounded-xl bg-white/15 py-2 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold tabular-nums">{value}</div>
            <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
