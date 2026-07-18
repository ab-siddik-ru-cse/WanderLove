'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Send, BookHeart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { IJournalEntry } from '@/types';

interface JournalBoardProps {
  tripId: string;
  initialEntries: IJournalEntry[];
  currentUserId: string;
  authorNames: Record<string, string>;
}

export function JournalBoard({ tripId, initialEntries, currentUserId, authorNames }: JournalBoardProps) {
  const [entries, setEntries] = useState<IJournalEntry[]>(initialEntries);
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePost = async () => {
    if (!text.trim()) {
      setError('Write something first 💕');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), image: image.trim() || undefined })
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Failed to post');
        return;
      }
      const newEntries: IJournalEntry[] = json.data.sharedJournal.map((e: any) => ({
        ...e,
        _id: String(e._id),
        authorId: String(e.authorId)
      }));
      setEntries(newEntries);
      setText('');
      setImage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="card-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <BookHeart className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold">Add a memory</h3>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Today's best moment..."
          rows={3}
          className="input-field resize-none"
        />
        <div className="mt-3">
          <Input
            placeholder="Photo URL (optional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div className="mt-3 flex justify-end">
          <Button onClick={() => void handlePost()} isLoading={isSubmitting}>
            <Send className="h-4 w-4" />
            Post
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {entries.length === 0 && (
          <p className="rounded-xl bg-blush p-6 text-center text-sm text-ink/40">
            No entries yet — write down your first moment together.
          </p>
        )}
        {entries
          .slice()
          .reverse()
          .map((entry) => (
            <motion.div key={entry._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-surface p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-primary-dark">
                  {entry.authorId === currentUserId ? 'You' : authorNames[entry.authorId] ?? 'Partner'}
                </p>
                <p className="text-xs text-ink/40">{format(new Date(entry.createdAt), 'MMM d, h:mm a')}</p>
              </div>
              {entry.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.image} alt="" className="mb-3 max-h-64 w-full rounded-xl object-cover" />
              )}
              <p className="whitespace-pre-wrap text-ink/80">{entry.text}</p>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
