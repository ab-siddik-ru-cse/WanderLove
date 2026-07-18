import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongoose';
import { getTripWithAccessCheck } from '@/lib/trip-auth';
import { serializeTrip } from '@/lib/serialize';
import { MapView } from '@/components/trip/MapView';
import { format } from 'date-fns';

interface TripMapPageProps {
  params: { tripId: string };
}

export default async function TripMapPage({ params }: TripMapPageProps) {
  const session = getCurrentUser();
  if (!session) redirect('/login');

  await connectDB();
  const { trip, hasAccess } = await getTripWithAccessCheck(params.tripId, session.userId);
  if (!trip) notFound();
  if (!hasAccess) redirect('/');

  const serialized = serializeTrip(trip);
  const isMaskedForViewer = session.userId !== serialized.createdBy;

  const points = serialized.days.flatMap((day) =>
    day.activities
      .filter((activity) => typeof activity.lat === 'number' && typeof activity.lng === 'number')
      .map((activity) => ({
        activity:
          activity.isSurprise && isMaskedForViewer
            ? { ...activity, title: '??? (surprise)' }
            : activity,
        dayLabel: format(new Date(day.date), 'MMM d')
      }))
  );

  return <MapView points={points} mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} />;
}
