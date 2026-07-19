'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, MapPin, Eye, Luggage } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTrips } from '@/hooks/useTrips';
import { cn } from '@/lib/utils';
import { Visibility } from '@/types';

interface PackingTemplateOption {
  name: string;
  items: string[];
}

interface TripCreateFormProps {
  packingTemplates: PackingTemplateOption[];
}

interface StepOneValues {
  name: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  timezone: string;
  currency: string;
  totalBudget: string;
}

const STEPS = [
  { id: 1, label: 'Details', icon: MapPin },
  { id: 2, label: 'Visibility', icon: Eye },
  { id: 3, label: 'Packing', icon: Luggage }
];

const VISIBILITY_OPTIONS: { value: Visibility; label: string; description: string }[] = [
  { value: Visibility.PARTNER, label: 'Partner Only', description: 'Only you and your linked partner can see this trip.' },
  { value: Visibility.PRIVATE, label: 'Private', description: 'Only you can see this trip.' },
  { value: Visibility.PUBLIC, label: 'Public', description: 'Anyone with the share link can view it.' }
];

export function TripCreateForm({ packingTemplates }: TripCreateFormProps) {
  const { createTrip, isLoading, error } = useTrips();
  const [step, setStep] = useState(1);

  const [details, setDetails] = useState<StepOneValues>({
    name: '',
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    timezone: 'Asia/Dhaka',
    currency: 'BDT',
    totalBudget: ''
  });
  const [detailErrors, setDetailErrors] = useState<Partial<Record<keyof StepOneValues, string>>>({});
  const [visibility, setVisibility] = useState<Visibility>(Visibility.PARTNER);
  const [packingTemplateName, setPackingTemplateName] = useState<string | undefined>(undefined);

  const validateStepOne = (): boolean => {
    const errs: Partial<Record<keyof StepOneValues, string>> = {};
    if (details.name.trim().length < 2) errs.name = 'Trip name is required';
    if (!details.destination.trim()) errs.destination = 'Destination is required';
    if (!details.country.trim()) errs.country = 'Country is required';
    if (!details.startDate) errs.startDate = 'Start date is required';
    if (!details.endDate) errs.endDate = 'End date is required';
    if (details.startDate && details.endDate && new Date(details.endDate) < new Date(details.startDate)) {
      errs.endDate = 'End date must be after start date';
    }
    if (!details.totalBudget || Number(details.totalBudget) < 0) errs.totalBudget = 'Enter a valid budget';
    setDetailErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validateStepOne()) return;
    setStep((s) => Math.min(s + 1, 3));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = () => {
    void createTrip({
      ...details,
      totalBudget: Number(details.totalBudget),
      visibility,
      packingTemplateName
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map(({ id, label, icon: Icon }, idx) => (
          <div key={id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  step === id
                    ? 'border-primary bg-love-gradient text-white'
                    : step > id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-ink/15 text-ink/30'
                )}
              >
                {step > id ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={cn('text-xs font-medium', step === id ? 'text-ink' : 'text-ink/40')}>{label}</span>
            </div>
            {idx < STEPS.length - 1 && <div className="h-px w-5 bg-ink/10 sm:w-10" />}
          </div>
        ))}
      </div>

      <div className="card-surface p-5 sm:p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              <h2 className="font-heading text-xl font-semibold">Where to, love? 💕</h2>
              <Input
                label="Trip name"
                placeholder="e.g. Our Cox's Bazar getaway"
                value={details.name}
                error={detailErrors.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Destination (city)"
                  placeholder="Cox's Bazar"
                  value={details.destination}
                  error={detailErrors.destination}
                  onChange={(e) => setDetails({ ...details, destination: e.target.value })}
                />
                <Input
                  label="Country"
                  placeholder="Bangladesh"
                  value={details.country}
                  error={detailErrors.country}
                  onChange={(e) => setDetails({ ...details, country: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Start date"
                  type="date"
                  value={details.startDate}
                  error={detailErrors.startDate}
                  onChange={(e) => setDetails({ ...details, startDate: e.target.value })}
                />
                <Input
                  label="End date"
                  type="date"
                  value={details.endDate}
                  error={detailErrors.endDate}
                  onChange={(e) => setDetails({ ...details, endDate: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="Timezone"
                  value={details.timezone}
                  onChange={(e) => setDetails({ ...details, timezone: e.target.value })}
                />
                <Input
                  label="Currency"
                  value={details.currency}
                  onChange={(e) => setDetails({ ...details, currency: e.target.value })}
                />
                <Input
                  label="Total budget"
                  type="number"
                  min={0}
                  placeholder="50000"
                  value={details.totalBudget}
                  error={detailErrors.totalBudget}
                  onChange={(e) => setDetails({ ...details, totalBudget: e.target.value })}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3"
            >
              <h2 className="font-heading text-xl font-semibold">Who gets to see this trip?</h2>
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVisibility(opt.value)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors',
                    visibility === opt.value ? 'border-primary bg-blush' : 'border-ink/10 hover:border-primary/40'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                      visibility === opt.value ? 'border-primary bg-primary' : 'border-ink/20'
                    )}
                  >
                    {visibility === opt.value && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-ink">{opt.label}</p>
                    <p className="text-sm text-ink/50">{opt.description}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3"
            >
              <h2 className="font-heading text-xl font-semibold">Pick a packing template (optional)</h2>
              <p className="text-sm text-ink/50">
                You can create custom packing templates later in Settings. For now, choose one or skip.
              </p>
              <button
                onClick={() => setPackingTemplateName(undefined)}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-colors',
                  packingTemplateName === undefined ? 'border-primary bg-blush' : 'border-ink/10 hover:border-primary/40'
                )}
              >
                <p className="font-medium">Skip for now</p>
                <p className="text-sm text-ink/50">Start with an empty packing checklist.</p>
              </button>
              {packingTemplates.length === 0 && (
                <p className="rounded-xl bg-blush p-4 text-sm text-ink/50">
                  No custom packing templates yet — add some in Settings (Step 3) and they&apos;ll show up here.
                </p>
              )}
              {packingTemplates.map((tpl) => (
                <button
                  key={tpl.name}
                  onClick={() => setPackingTemplateName(tpl.name)}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-colors',
                    packingTemplateName === tpl.name ? 'border-primary bg-blush' : 'border-ink/10 hover:border-primary/40'
                  )}
                >
                  <p className="font-medium">{tpl.name}</p>
                  <p className="text-sm text-ink/50">{tpl.items.length} items</p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="mt-4 text-sm text-red-500 dark:text-red-400">{error}</p>}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={goNext}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={isLoading}>
              Create trip 💕
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
