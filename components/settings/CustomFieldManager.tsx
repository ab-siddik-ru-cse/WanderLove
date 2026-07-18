'use client';

import { useState } from 'react';
import { ListPlus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';
import type { ICustomFieldDefinition } from '@/types';

interface CustomFieldManagerProps {
  initialFields: ICustomFieldDefinition[];
}

const FIELD_TYPES: ICustomFieldDefinition['fieldType'][] = ['text', 'number', 'date'];

export function CustomFieldManager({ initialFields }: CustomFieldManagerProps) {
  const { savePreferences, isSaving, error, savedAt } = useSettings();
  const [fields, setFields] = useState<ICustomFieldDefinition[]>(initialFields);
  const [name, setName] = useState('');
  const [type, setType] = useState<ICustomFieldDefinition['fieldType']>('text');

  const addField = () => {
    if (!name.trim()) return;
    if (fields.some((f) => f.fieldName.toLowerCase() === name.trim().toLowerCase())) return;
    setFields([...fields, { fieldName: name.trim(), fieldType: type }]);
    setName('');
    setType('text');
  };

  const removeField = (fieldName: string) => {
    setFields(fields.filter((f) => f.fieldName !== fieldName));
  };

  const handleSave = () => {
    void savePreferences({ customActivityFields: fields });
  };

  return (
    <div className="card-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <ListPlus className="h-5 w-5 text-primary" />
        <h3 className="font-heading text-lg font-semibold">Custom activity fields</h3>
      </div>
      <p className="mb-4 text-sm text-ink/50">
        Add fields like &quot;Booking reference&quot; — they&apos;ll automatically appear in every activity form.
      </p>

      <div className="flex flex-wrap gap-2">
        {fields.map((f) => (
          <span key={f.fieldName} className="flex items-center gap-1.5 rounded-full bg-blush px-3 py-1.5 text-sm text-primary-dark">
            {f.fieldName} <span className="text-xs opacity-60">({f.fieldType})</span>
            <button onClick={() => removeField(f.fieldName)} aria-label={`Remove ${f.fieldName}`}>
              <Trash2 className="h-3.5 w-3.5 hover:text-red-500" />
            </button>
          </span>
        ))}
        {fields.length === 0 && <p className="text-sm text-ink/40">No custom fields yet.</p>}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <div className="flex-1">
          <Input label="Field name" placeholder="Booking reference" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink/70">Type</p>
          <div className="flex gap-1">
            {FIELD_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'rounded-lg border-2 px-2.5 py-2.5 text-xs font-medium capitalize transition-colors',
                  type === t ? 'border-primary bg-blush' : 'border-ink/10 text-ink/50'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <Button variant="secondary" onClick={addField} className="!px-4 !py-2.5 text-sm">
          Add
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleSave} isLoading={isSaving} className="!px-4 !py-2 text-sm">
          Save fields
        </Button>
        {savedAt && <span className="text-xs text-ink/40">Saved ✓</span>}
      </div>
    </div>
  );
}
