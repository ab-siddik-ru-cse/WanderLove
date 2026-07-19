'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Camera, Pencil } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TripEditModal } from '@/components/trip/TripEditModal';
import { Visibility } from '@/types';

interface TripHeaderProps {
  tripId: string;
  name: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  timezone: string;
  currency: string;
  totalBudget: number;
  visibility: Visibility;
}

export function TripHeader({
  tripId,
  name,
  destination,
  country,
  startDate,
  endDate,
  coverImage,
  timezone,
  currency,
  totalBudget,
  visibility
}: TripHeaderProps) {
  const [details, setDetails] = useState({
    name,
    destination,
    country,
    startDate,
    endDate,
    timezone,
    currency,
    totalBudget,
    visibility
  });
  const [cover, setCover] = useState(coverImage);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(coverImage ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveCover = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage: imageUrl.trim() })
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Failed to update cover image');
        return;
      }
      setCover(imageUrl.trim());
      setIsCoverModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-6 overflow-hidden rounded-xl2 shadow-soft">
      <div
        className="relative flex min-h-[160px] items-end bg-love-gradient bg-cover bg-center p-4 sm:min-h-[200px] sm:p-6"
        style={cover ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url(${cover})` } : undefined}
      >
        <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1.5 sm:right-4 sm:top-4">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/30 sm:px-3"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit trip</span>
          </button>
          <button
            onClick={() => {
              setImageUrl(cover ?? '');
              setError(null);
              setIsCoverModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/30 sm:px-3"
          >
            <Camera className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{cover ? 'Change cover' : 'Add cover'}</span>
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-full">
          <h1 className="font-heading text-xl font-bold text-white drop-shadow-sm sm:text-3xl">{details.name}</h1>
          <p className="mt-1 text-xs text-white/90 drop-shadow-sm sm:text-sm">
            {details.destination}
            {details.country ? `, ${details.country}` : ''} · {format(new Date(details.startDate), 'MMM d')} –{' '}
            {format(new Date(details.endDate), 'MMM d, yyyy')}
          </p>
        </motion.div>
      </div>

      <Modal isOpen={isCoverModalOpen} onClose={() => setIsCoverModalOpen(false)} title="Set cover photo">
        <div className="flex flex-col gap-4">
          <Input
            label="Image URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {imageUrl.trim() && (
            <div
              className="h-32 w-full rounded-xl bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl.trim()})` }}
            />
          )}
          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          <Button onClick={() => void handleSaveCover()} isLoading={isSaving} className="w-full">
            Save cover photo
          </Button>
        </div>
      </Modal>

      <TripEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tripId={tripId}
        initial={details}
        onSaved={(updated) => setDetails((prev) => ({ ...prev, ...updated }))}
      />
    </div>
  );
}
