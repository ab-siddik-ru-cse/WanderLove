'use client';

import { LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import type { IPublicUser } from '@/types';

interface NavbarProps {
  user: Pick<IPublicUser, 'name' | 'email'>;
}

export function Navbar({ user }: NavbarProps) {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-ink/5 bg-white/70 px-6 py-4">
      <div>
        <p className="text-sm text-ink/50">Welcome back,</p>
        <p className="font-heading text-lg font-semibold">{user.name} 💖</p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/trips/new">
          <Button variant="primary" className="!px-4 !py-2 text-sm">
            <Plus className="h-4 w-4" />
            New Trip
          </Button>
        </Link>
        <button
          onClick={() => void logout()}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink/50 hover:bg-blush hover:text-ink"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </header>
  );
}
