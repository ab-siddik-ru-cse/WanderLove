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
    // Fast tick so the seconds/milliseconds boxes actually feel "live".
    const interval = setInterval(() => {
      setParts(getCountdownParts(new Date(targetDate)));
    }, 47);
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
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {[
          { value: parts.days, label: 'Days' },
          { value: parts.hours, label: 'Hrs' },
          { value: parts.minutes, label: 'Mins' },
          { value: parts.seconds, label: 'Secs' },
          { value: parts.milliseconds, label: 'Ms', isMs: true }
        ].map(({ value, label, isMs }) => (
          <div key={label} className="rounded-xl bg-white/15 py-2 text-center backdrop-blur-sm">
            <div className="tabular-nums text-lg font-bold sm:text-2xl">
              {isMs ? String(value).padStart(3, '0') : value}
            </div>
            <div className="text-[10px] uppercase tracking-wide opacity-80 sm:text-xs">{label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
