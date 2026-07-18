'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface TripHeaderProps {
  tripId: string;
  name: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
}

export function TripHeader({ tripId, name, destination, country, startDate, endDate, coverImage }: TripHeaderProps) {
  const [cover, setCover] = useState(coverImage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(coverImage ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
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
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-6 overflow-hidden rounded-xl2 shadow-soft">
      <div
        className="relative flex min-h-[160px] items-end bg-love-gradient bg-cover bg-center p-6 sm:min-h-[200px]"
        style={cover ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url(${cover})` } : undefined}
      >
        <button
          onClick={() => {
            setImageUrl(cover ?? '');
            setError(null);
            setIsModalOpen(true);
          }}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/30"
        >
          <Camera className="h-3.5 w-3.5" />
          {cover ? 'Change cover' : 'Add cover photo'}
        </button>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-white drop-shadow-sm sm:text-3xl">{name}</h1>
          <p className="mt-1 text-sm text-white/90 drop-shadow-sm">
            {destination}
            {country ? `, ${country}` : ''} · {format(new Date(startDate), 'MMM d')} – {format(new Date(endDate), 'MMM d, yyyy')}
          </p>
        </motion.div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set cover photo">
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
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={() => void handleSave()} isLoading={isSaving} className="w-full">
            Save cover photo
          </Button>
        </div>
      </Modal>
    </div>
  );
}
