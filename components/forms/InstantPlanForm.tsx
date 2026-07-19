'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Mountain, Waves } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTrips } from '@/hooks/useTrips';
import { cn } from '@/lib/utils';

const MOODS = [
  { value: 'romantic' as const, label: 'Romantic', icon: Heart },
  { value: 'adventure' as const, label: 'Adventure', icon: Mountain },
  { value: 'relax' as const, label: 'Relax', icon: Waves }
];

export function InstantPlanForm() {
  const { createInstantPlan, isLoading, error } = useTrips();
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('3');
  const [totalBudget, setTotalBudget] = useState('');
  const [mood, setMood] = useState<'romantic' | 'adventure' | 'relax'>('romantic');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setFormError('Tell us where you want to go');
      return;
    }
    if (!totalBudget || Number(totalBudget) < 0) {
      setFormError('Enter a valid budget');
      return;
    }
    setFormError(null);
    void createInstantPlan({
      destination: destination.trim(),
      days: Number(days),
      totalBudget: Number(totalBudget),
      mood
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface mx-auto flex max-w-xl flex-col gap-5 p-8"
    >
      <div className="text-center">
        <Sparkles className="mx-auto mb-2 h-8 w-8 text-primary" />
        <h1 className="font-heading text-xl font-semibold">Instant Plan ✨</h1>
        <p className="text-sm text-ink/50">Tell us the vibe — we&apos;ll build the trip in seconds.</p>
      </div>

      <Input label="Destination" placeholder="e.g. Bali, Cox's Bazar, Bandarban" value={destination} onChange={(e) => setDestination(e.target.value)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="How many days?" type="number" min={1} max={30} value={days} onChange={(e) => setDays(e.target.value)} />
        <Input
          label="Total budget"
          type="number"
          min={0}
          placeholder="20000"
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink/70">Mood</p>
        <div className="grid grid-cols-3 gap-3">
          {MOODS.map(({ value, label, icon: Icon }) => (
            <button
              type="button"
              key={value}
              onClick={() => setMood(value)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border-2 py-4 transition-colors',
                mood === value ? 'border-primary bg-blush text-primary-dark' : 'border-ink/10 text-ink/50 hover:border-primary/40'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {(formError || error) && <p className="text-sm text-red-500 dark:text-red-400">{formError ?? error}</p>}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Generate my trip
      </Button>
    </motion.form>
  );
}
