'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, LayoutDashboard, Sparkles, Settings, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'My Trips', icon: LayoutDashboard },
  { href: '/instant', label: 'Instant Plan', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink/5 bg-white/70 p-6 md:flex">
      <div className="mb-8 flex items-center gap-2">
        <Heart className="h-6 w-6 fill-primary text-primary" />
        <span className="font-heading text-lg font-bold text-ink">WanderLove</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-love-gradient text-white shadow-soft' : 'text-ink/60 hover:bg-blush hover:text-ink'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center gap-2 rounded-xl bg-blush p-3 text-xs text-ink/50">
        <Map className="h-4 w-4" />
        Plan it together, live it together.
      </div>
    </aside>
  );
}
