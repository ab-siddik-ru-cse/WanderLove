'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mood } from '@/types';
import type { ICustomFieldDefinition, IActivity } from '@/types';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface ActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onDelete?: () => Promise<void>;
  categories: string[];
  customFieldDefinitions: ICustomFieldDefinition[];
  currency: string;
  initialActivity?: IActivity | null;
  isSubmitting: boolean;
  currentUserId: string;
  partnerId?: string | null;
  partnerName?: string | null;
}

const MOOD_OPTIONS = Object.values(Mood);

export function ActivityForm({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  categories,
  customFieldDefinitions,
  currency,
  initialActivity,
  isSubmitting,
  currentUserId,
  partnerId,
  partnerName
}: ActivityFormProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [cost, setCost] = useState('0');
  const [category, setCategory] = useState(categories[0] ?? 'General');
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [isSurprise, setIsSurprise] = useState(false);
  const [notes, setNotes] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialActivity?.title ?? '');
    setLocation(initialActivity?.location ?? '');
    setTime(initialActivity?.time ?? '');
    setCost(String(initialActivity?.cost ?? 0));
    setCategory(initialActivity?.category ?? categories[0] ?? 'General');
    setMood(initialActivity?.mood);
    setIsSurprise(initialActivity?.isSurprise ?? false);
    setNotes(initialActivity?.notes ?? '');
    setCustomValues(initialActivity?.customFields ?? {});
    setPaidBy(initialActivity?.paidBy ?? currentUserId);
    setLat(initialActivity?.lat !== undefined ? String(initialActivity.lat) : '');
    setLng(initialActivity?.lng !== undefined ? String(initialActivity.lng) : '');
    setError(null);
  }, [isOpen, initialActivity, categories, currentUserId]);

  const handleSubmit = async () => {
    if (!title.trim() || !location.trim() || !time.trim()) {
      setError('Title, location, and time are required');
      return;
    }
    setError(null);
    await onSubmit({
      title: title.trim(),
      location: location.trim(),
      time: time.trim(),
      cost: Number(cost) || 0,
      currency,
      category,
      mood,
      isSurprise,
      notes: notes.trim() || undefined,
      customFields: customValues,
      paidBy,
      lat: lat.trim() ? Number(lat) : undefined,
      lng: lng.trim() ? Number(lng) : undefined
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialActivity ? 'Edit activity' : 'Add activity'}>
      <div className="flex flex-col gap-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sunset boat ride" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Beachfront" />
          <Input label="Time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="6:00 PM" />
        </div>
        <Input label={`Cost (${currency})`} type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} />

        {partnerId && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink/70">Who paid?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaidBy(currentUserId)}
                className={cn(
                  'rounded-xl border-2 py-2 text-sm font-medium transition-colors',
                  paidBy === currentUserId ? 'border-primary bg-blush text-primary-dark' : 'border-ink/10 text-ink/50 hover:border-primary/40'
                )}
              >
                Me
              </button>
              <button
                type="button"
                onClick={() => setPaidBy(partnerId)}
                className={cn(
                  'rounded-xl border-2 py-2 text-sm font-medium transition-colors',
                  paidBy === partnerId ? 'border-primary bg-blush text-primary-dark' : 'border-ink/10 text-ink/50 hover:border-primary/40'
                )}
              >
                {partnerName ?? 'Partner'}
              </button>
            </div>
          </div>
        )}

        <details className="rounded-xl border border-ink/10 p-3">
          <summary className="cursor-pointer text-sm font-medium text-ink/60">
            Map coordinates (optional, shows this activity on the Map tab)
          </summary>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Latitude" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="21.4272" />
            <Input label="Longitude" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="92.0058" />
          </div>
        </details>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink/70">Category</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink/70">Mood</p>
          <div className="flex gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(mood === m ? undefined : m)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl border-2 text-lg transition-colors',
                  mood === m ? 'border-primary bg-blush' : 'border-ink/10 hover:border-primary/40'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {customFieldDefinitions.length > 0 && (
          <div className="flex flex-col gap-3 rounded-xl bg-blush/60 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">Custom fields</p>
            {customFieldDefinitions.map((def) => (
              <Input
                key={def.fieldName}
                label={def.fieldName}
                type={def.fieldType === 'number' ? 'number' : def.fieldType === 'date' ? 'date' : 'text'}
                value={customValues[def.fieldName] ?? ''}
                onChange={(e) => setCustomValues({ ...customValues, [def.fieldName]: e.target.value })}
              />
            ))}
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={isSurprise} onChange={(e) => setIsSurprise(e.target.checked)} className="h-4 w-4 rounded" />
          Mark as a surprise (title & cost hidden from your partner) 🎁
        </label>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        <div className="mt-2 flex items-center justify-between gap-3">
          {initialActivity && onDelete ? (
            <button
              type="button"
              onClick={() => void onDelete()}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          ) : (
            <span />
          )}
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            {initialActivity ? 'Save changes' : 'Add activity'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
