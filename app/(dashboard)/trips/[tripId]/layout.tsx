import type { ReactNode } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongoose';
import { getTripWithAccessCheck } from '@/lib/trip-auth';
import { TripTabs } from '@/components/trip/TripTabs';
import { format } from 'date-fns';

interface TripLayoutProps {
  children: ReactNode;
  params: { tripId: string };
}

export default async function TripLayout({ children, params }: TripLayoutProps) {
  const session = getCurrentUser();
  if (!session) redirect('/login');

  await connectDB();
  const { trip, hasAccess } = await getTripWithAccessCheck(params.tripId, session.userId);

  if (!trip) notFound();
  if (!hasAccess) {
    redirect('/');
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-ink">{trip.name}</h1>
        <p className="text-sm text-ink/50">
          {trip.destination}
          {trip.country ? `, ${trip.country}` : ''} · {format(new Date(trip.startDate), 'MMM d')} –{' '}
          {format(new Date(trip.endDate), 'MMM d, yyyy')}
        </p>
      </div>
      <TripTabs tripId={params.tripId} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
