'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Visibility } from '@/types';
import { cn } from '@/lib/utils';

interface TripEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  initial: {
    name: string;
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    timezone: string;
    currency: string;
    totalBudget: number;
    visibility: Visibility;
  };
  onSaved: (updated: Partial<TripEditModalProps['initial']>) => void;
}

const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: Visibility.PARTNER, label: 'Partner Only' },
  { value: Visibility.PRIVATE, label: 'Private' },
  { value: Visibility.PUBLIC, label: 'Public' }
];

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function TripEditModal({ isOpen, onClose, tripId, initial, onSaved }: TripEditModalProps) {
  const [form, setForm] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(initial);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.destination.trim()) {
      setError('Trip name and destination are required');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date must be on or after the start date');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Failed to save changes');
        return;
      }
      onSaved(form);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit trip details">
      <div className="flex flex-col gap-4">
        <Input label="Trip name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Destination"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          />
          <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            value={toDateInputValue(form.startDate)}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <Input
            label="End date"
            type="date"
            value={toDateInputValue(form.endDate)}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input label="Timezone" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
          <Input label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          <Input
            label="Total budget"
            type="number"
            min={0}
            value={form.totalBudget}
            onChange={(e) => setForm({ ...form, totalBudget: Number(e.target.value) })}
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink/70">Visibility</p>
          <div className="grid grid-cols-3 gap-2">
            {VISIBILITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, visibility: opt.value })}
                className={cn(
                  'rounded-xl border-2 px-2 py-2 text-xs font-medium transition-colors sm:text-sm',
                  form.visibility === opt.value ? 'border-primary bg-blush text-primary-dark' : 'border-ink/10 text-ink/50 hover:border-primary/40'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        <Button onClick={() => void handleSave()} isLoading={isSaving} className="w-full">
          Save changes
        </Button>
      </div>
    </Modal>
  );
}
