'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Failed to change password');
        return;
      }
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <h2 className="mb-4 font-heading text-lg font-semibold">Change password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        {success && <p className="text-sm text-primary-dark">Password updated 🔒</p>}
        <Button type="submit" isLoading={isSaving} className="self-start">
          Update password
        </Button>
      </form>
    </Card>
  );
}
