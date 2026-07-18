import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { ThemeInjector } from '@/components/ThemeInjector';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = getCurrentUser();
  if (!session) {
    redirect('/login');
  }

  await connectDB();
  const user = await User.findById(session.userId).lean();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="paper-texture flex min-h-screen bg-blush">
      <ThemeInjector primary={user.preferences.theme.primary} secondary={user.preferences.theme.secondary} />
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar user={{ name: user.name, email: user.email }} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
