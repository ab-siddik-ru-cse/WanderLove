'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Heart, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from './nav-items';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-ink/60 hover:bg-blush"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white p-6 shadow-soft"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6 fill-primary text-primary" />
                  <span className="font-heading text-lg font-bold text-ink">WanderLove</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-blush"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
