import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="paper-texture flex min-h-screen items-center justify-center bg-love-gradient p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">WanderLove 💕</h1>
          <p className="mt-1 text-white/80">Your couple travel command center</p>
        </div>
        <div className="card-surface p-8">{children}</div>
      </div>
    </div>
  );
}
