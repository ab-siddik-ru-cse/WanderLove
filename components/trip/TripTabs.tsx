'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListTodo, Map, PieChart, BookHeart } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'itinerary', label: 'Itinerary', icon: ListTodo },
  { key: 'map', label: 'Map', icon: Map },
  { key: 'budget', label: 'Budget', icon: PieChart },
  { key: 'journal', label: 'Journal', icon: BookHeart }
];

export function TripTabs({ tripId }: { tripId: string }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 rounded-xl2 bg-white p-1.5 shadow-card">
      {TABS.map(({ key, label, icon: Icon }) => {
        const href = `/trips/${tripId}/${key}`;
        const isActive = pathname === href;
        return (
          <Link
            key={key}
            href={href}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-love-gradient text-white' : 'text-ink/50 hover:bg-blush hover:text-ink'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
