import type { ReactNode } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongoose';
import { getTripWithAccessCheck } from '@/lib/trip-auth';
import { TripTabs } from '@/components/trip/TripTabs';
import { TripHeader } from '@/components/trip/TripHeader';

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
      <TripHeader
        tripId={params.tripId}
        name={trip.name}
        destination={trip.destination}
        country={trip.country}
        startDate={trip.startDate.toISOString()}
        endDate={trip.endDate.toISOString()}
        coverImage={trip.coverImage}
        timezone={trip.timezone}
        currency={trip.currency}
        totalBudget={trip.totalBudget}
        visibility={trip.visibility}
      />
      <TripTabs tripId={params.tripId} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
