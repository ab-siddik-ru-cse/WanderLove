'use client';

import { useState } from 'react';
import { Heart, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ExpenseSplitRule } from '@/types';

interface CoupleAndSplitSettingsProps {
  hasPartner: boolean;
  partnerName?: string | null;
  initialSplitRule: ExpenseSplitRule;
}

const SPLIT_OPTIONS: { value: ExpenseSplitRule; label: string }[] = [
  { value: ExpenseSplitRule.HALF, label: 'Split half & half' },
  { value: ExpenseSplitRule.ME, label: "I'll usually pay" },
  { value: ExpenseSplitRule.PARTNER, label: 'Partner usually pays' }
];

export function CoupleAndSplitSettings({ hasPartner, partnerName, initialSplitRule }: CoupleAndSplitSettingsProps) {
  const router = useRouter();
  const { savePreferences, isSaving, error: saveError, savedAt } = useSettings();
  const [splitRule, setSplitRule] = useState<ExpenseSplitRule>(initialSplitRule);

  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [acceptCode, setAcceptCode] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  const getLinkCode = async () => {
    setLinkLoading(true);
    setLinkError(null);
    try {
      const res = await fetch('/api/auth/partner/link');
      const json = await res.json();
      if (!json.success) {
        setLinkError(json.error ?? 'Failed to get code');
        return;
      }
      setLinkCode(json.data.code);
    } finally {
      setLinkLoading(false);
    }
  };

  const copyCode = async () => {
    if (!linkCode) return;
    await navigator.clipboard.writeText(linkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const acceptPartner = async () => {
    if (!acceptCode.trim()) return;
    setLinkLoading(true);
    setLinkError(null);
    try {
      const res = await fetch('/api/auth/partner/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: acceptCode.trim() })
      });
      const json = await res.json();
      if (!json.success) {
        setLinkError(json.error ?? 'Failed to link partner');
        return;
      }
      router.refresh();
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="card-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 fill-primary text-primary" />
        <h3 className="font-heading text-lg font-semibold">Partner &amp; expense splitting</h3>
      </div>

      {hasPartner ? (
        <p className="mb-4 rounded-xl bg-blush p-4 text-sm text-ink/70">
          You&apos;re linked with <span className="font-semibold">{partnerName ?? 'your partner'}</span> 💕
        </p>
      ) : (
        <div className="mb-4 flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm text-ink/60">Share this code with your partner:</p>
            {linkCode ? (
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-blush px-4 py-2 font-mono text-lg font-semibold text-primary-dark">{linkCode}</span>
                <button onClick={() => void copyCode()} className="rounded-lg p-2 hover:bg-blush" aria-label="Copy code">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-ink/50" />}
                </button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => void getLinkCode()} isLoading={linkLoading} className="!px-4 !py-2 text-sm">
                Get my link code
              </Button>
            )}
          </div>
          <div>
            <p className="mb-2 text-sm text-ink/60">Got a code from your partner?</p>
            <div className="flex gap-2">
              <Input placeholder="LOVE-XXXX" value={acceptCode} onChange={(e) => setAcceptCode(e.target.value)} />
              <Button variant="secondary" onClick={() => void acceptPartner()} isLoading={linkLoading} className="shrink-0 !px-4 !py-2.5 text-sm">
                Link up
              </Button>
            </div>
          </div>
          {linkError && <p className="text-sm text-red-500">{linkError}</p>}
        </div>
      )}

      <p className="mb-2 text-sm font-medium text-ink/70">Default expense split rule</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {SPLIT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSplitRule(opt.value)}
            className={cn(
              'rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-colors',
              splitRule === opt.value ? 'border-primary bg-blush text-primary-dark' : 'border-ink/10 text-ink/50 hover:border-primary/40'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {saveError && <p className="mt-3 text-sm text-red-500">{saveError}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={() => void savePreferences({ defaultSplitRule: splitRule })} isLoading={isSaving} className="!px-4 !py-2 text-sm">
          Save split rule
        </Button>
        {savedAt && <span className="text-xs text-ink/40">Saved ✓</span>}
      </div>
    </div>
  );
}
