'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ProfileDetailsFormProps {
  initialName: string;
  initialBio: string;
}

export function ProfileDetailsForm({ initialName, initialBio }: ProfileDetailsFormProps) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() })
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Failed to save');
        return;
      }
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <h2 className="mb-4 font-heading text-lg font-semibold">Your details</h2>
      <div className="flex flex-col gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/70">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="Tell your partner (or the world) a little about you..."
            className="input-field resize-none"
          />
          <p className="mt-1 text-right text-xs text-ink/30">{bio.length}/280</p>
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        {saved && <p className="text-sm text-primary-dark">Saved 💕</p>}
        <Button onClick={() => void handleSave()} isLoading={isSaving} className="self-start">
          Save changes
        </Button>
      </div>
    </Card>
  );
}
