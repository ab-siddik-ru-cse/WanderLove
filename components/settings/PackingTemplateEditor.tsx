'use client';

import { useState } from 'react';
import { Luggage, Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';
import type { IPackingTemplate } from '@/types';

interface PackingTemplateEditorProps {
  initialTemplates: IPackingTemplate[];
}

export function PackingTemplateEditor({ initialTemplates }: PackingTemplateEditorProps) {
  const { savePreferences, isSaving, error, savedAt } = useSettings();
  const [templates, setTemplates] = useState<IPackingTemplate[]>(initialTemplates);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [itemDrafts, setItemDrafts] = useState<Record<string, string>>({});

  const addTemplate = () => {
    const trimmed = newTemplateName.trim();
    if (!trimmed || templates.some((t) => t.name === trimmed)) return;
    setTemplates([...templates, { name: trimmed, items: [] }]);
    setNewTemplateName('');
  };

  const removeTemplate = (name: string) => {
    setTemplates(templates.filter((t) => t.name !== name));
  };

  const addItem = (templateName: string) => {
    const item = (itemDrafts[templateName] ?? '').trim();
    if (!item) return;
    setTemplates(
      templates.map((t) => (t.name === templateName ? { ...t, items: [...t.items, item] } : t))
    );
    setItemDrafts({ ...itemDrafts, [templateName]: '' });
  };

  const removeItem = (templateName: string, item: string) => {
    setTemplates(
      templates.map((t) => (t.name === templateName ? { ...t, items: t.items.filter((i) => i !== item) } : t))
    );
  };

  const handleSave = () => {
    void savePreferences({ packingTemplates: templates });
  };

  return (
    <div className="card-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Luggage className="h-5 w-5 text-primary" />
        <h3 className="font-heading text-lg font-semibold">Packing templates</h3>
      </div>
      <p className="mb-4 text-sm text-ink/50">Reusable packing lists (Beach, Mountain, City...) offered in the Trip Wizard.</p>

      <div className="flex flex-col gap-4">
        {templates.map((template) => (
          <div key={template.name} className="rounded-xl border border-ink/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-ink">{template.name}</p>
              <button onClick={() => removeTemplate(template.name)} aria-label={`Remove ${template.name}`}>
                <Trash2 className="h-4 w-4 text-ink/40 hover:text-red-500 dark:hover:text-red-400" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {template.items.map((item) => (
                <span key={item} className="flex items-center gap-1 rounded-full bg-blush px-2.5 py-1 text-xs text-primary-dark">
                  {item}
                  <button onClick={() => removeItem(template.name, item)} aria-label={`Remove ${item}`}>
                    <Trash2 className="h-3 w-3 hover:text-red-500 dark:hover:text-red-400" />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Sunscreen"
                value={itemDrafts[template.name] ?? ''}
                onChange={(e) => setItemDrafts({ ...itemDrafts, [template.name]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addItem(template.name)}
                className="!py-2 text-sm"
              />
              <Button variant="ghost" onClick={() => addItem(template.name)} className="shrink-0 !px-3 !py-2 text-sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {templates.length === 0 && <p className="text-sm text-ink/40">No packing templates yet.</p>}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          placeholder="New template name (e.g. Beach)"
          value={newTemplateName}
          onChange={(e) => setNewTemplateName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTemplate()}
        />
        <Button variant="secondary" onClick={addTemplate} className="shrink-0 !px-4 !py-2.5 text-sm">
          New template
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleSave} isLoading={isSaving} className="!px-4 !py-2 text-sm">
          Save templates
        </Button>
        {savedAt && <span className="text-xs text-ink/40">Saved ✓</span>}
      </div>
    </div>
  );
}
