'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, UserCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar?: string | null;
  coverImage?: string | null;
}

type EditTarget = 'avatar' | 'cover' | null;

export function ProfileHeader({ name, email, avatar, coverImage }: ProfileHeaderProps) {
  const [currentAvatar, setCurrentAvatar] = useState(avatar ?? '');
  const [currentCover, setCurrentCover] = useState(coverImage ?? '');
  const [editing, setEditing] = useState<EditTarget>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEditor = (target: EditTarget) => {
    setImageUrl(target === 'avatar' ? currentAvatar : currentCover);
    setError(null);
    setEditing(target);
  };

  const handleSave = async () => {
    if (!editing) return;
    setIsSaving(true);
    setError(null);
    try {
      const field = editing === 'avatar' ? 'avatar' : 'coverImage';
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: imageUrl.trim() })
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Failed to save');
        return;
      }
      if (editing === 'avatar') setCurrentAvatar(imageUrl.trim());
      else setCurrentCover(imageUrl.trim());
      setEditing(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-16 overflow-hidden rounded-xl2 shadow-soft">
      <div
        className="relative h-40 bg-love-gradient bg-cover bg-center sm:h-52"
        style={currentCover ? { backgroundImage: `url(${currentCover})` } : undefined}
      >
        <button
          onClick={() => openEditor('cover')}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/30"
        >
          <Camera className="h-3.5 w-3.5" />
          {currentCover ? 'Change cover' : 'Add cover photo'}
        </button>

        {/* Avatar overlaps the bottom edge of the banner */}
        <div className="absolute -bottom-12 left-6 flex items-end gap-2 sm:left-8">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-blush shadow-card sm:h-28 sm:w-28">
              {currentAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentAvatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                <UserCircle2 className="h-14 w-14 text-primary/50" />
              )}
            </div>
            <button
              onClick={() => openEditor('avatar')}
              className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-love-gradient text-white shadow-card hover:scale-105"
              aria-label="Change avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-surface px-6 pb-6 pt-16 sm:px-8">
        <h1 className="font-heading text-2xl font-bold text-ink">{name}</h1>
        <p className="text-sm text-ink/50">{email}</p>
      </motion.div>

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title={editing === 'avatar' ? 'Set profile photo' : 'Set cover photo'}>
        <div className="flex flex-col gap-4">
          <Input
            label="Image URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {imageUrl.trim() && (
            <div
              className={
                editing === 'avatar'
                  ? 'mx-auto h-24 w-24 rounded-full bg-cover bg-center'
                  : 'h-32 w-full rounded-xl bg-cover bg-center'
              }
              style={{ backgroundImage: `url(${imageUrl.trim()})` }}
            />
          )}
          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          <Button onClick={() => void handleSave()} isLoading={isSaving} className="w-full">
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
}
