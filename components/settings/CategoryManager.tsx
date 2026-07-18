'use client';

import { useState } from 'react';
import { Tags, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';

interface CategoryManagerProps {
  initialCategories: string[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const { savePreferences, isSaving, error, savedAt } = useSettings();
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [name, setName] = useState('');

  const addCategory = () => {
    const trimmed = name.trim();
    if (!trimmed || categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return;
    setCategories([...categories, trimmed]);
    setName('');
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  const handleSave = () => {
    void savePreferences({ customCategories: categories });
  };

  return (
    <div className="card-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Tags className="h-5 w-5 text-primary" />
        <h3 className="font-heading text-lg font-semibold">Custom categories</h3>
      </div>
      <p className="mb-4 text-sm text-ink/50">e.g. &quot;Selfie spot&quot; — shows up in the activity category dropdown.</p>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <span key={c} className="flex items-center gap-1.5 rounded-full bg-blush px-3 py-1.5 text-sm text-primary-dark">
            {c}
            <button onClick={() => removeCategory(c)} aria-label={`Remove ${c}`}>
              <Trash2 className="h-3.5 w-3.5 hover:text-red-500" />
            </button>
          </span>
        ))}
        {categories.length === 0 && <p className="text-sm text-ink/40">No custom categories yet.</p>}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          placeholder="Selfie spot"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
        />
        <Button variant="secondary" onClick={addCategory} className="shrink-0 !px-4 !py-2.5 text-sm">
          Add
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleSave} isLoading={isSaving} className="!px-4 !py-2 text-sm">
          Save categories
        </Button>
        {savedAt && <span className="text-xs text-ink/40">Saved ✓</span>}
      </div>
    </div>
  );
}
