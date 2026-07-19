'use client';

import { LogOut, Plus, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { MobileNav } from '@/components/layout/MobileNav';
import { ThemeModeToggle } from '@/components/ThemeModeToggle';
import type { IPublicUser } from '@/types';

interface NavbarProps {
  user: Pick<IPublicUser, 'name' | 'email' | 'avatar'>;
}

export function Navbar({ user }: NavbarProps) {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-ink/5 bg-surface/70 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <Link href="/profile" className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 hover:bg-blush">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blush">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <UserCircle2 className="h-6 w-6 text-primary/50" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-ink/50">Welcome back,</p>
            <p className="font-heading text-base font-semibold leading-tight">{user.name} 💖</p>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeModeToggle />
        <Link href="/trips/new">
          <Button variant="primary" className="!px-3 !py-2 text-sm sm:!px-4">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Trip</span>
          </Button>
        </Link>
        <button
          onClick={() => void logout()}
          className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-ink/50 hover:bg-blush hover:text-ink sm:px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
