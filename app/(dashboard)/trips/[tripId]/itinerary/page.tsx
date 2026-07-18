import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongoose';
import { getTripWithAccessCheck } from '@/lib/trip-auth';
import { User } from '@/models/User';
import { serializeTrip } from '@/lib/serialize';
import { ItineraryBoard } from '@/components/trip/ItineraryBoard';

interface ItineraryPageProps {
  params: { tripId: string };
}

const DEFAULT_CATEGORIES = ['General', 'Romantic', 'Adventure', 'Food', 'Shopping'];

export default async function ItineraryPage({ params }: ItineraryPageProps) {
  const session = getCurrentUser();
  if (!session) redirect('/login');

  await connectDB();
  const { trip, hasAccess } = await getTripWithAccessCheck(params.tripId, session.userId);

  if (!trip) notFound();
  if (!hasAccess) redirect('/');

  const currentUser = await User.findById(session.userId).lean();
  const categories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...(currentUser?.preferences.customCategories ?? [])])
  );

  let partnerName: string | null = null;
  if (currentUser?.partnerId) {
    const partner = await User.findById(currentUser.partnerId).lean();
    partnerName = partner?.name ?? null;
  }

  const serialized = serializeTrip(trip);

  return (
    <ItineraryBoard
      tripId={params.tripId}
      initialDays={serialized.days}
      categories={categories}
      customFieldDefinitions={currentUser?.preferences.customActivityFields ?? []}
      currency={serialized.currency}
      currentUserId={session.userId}
      tripCreatedBy={serialized.createdBy}
      partnerId={currentUser?.partnerId?.toString() ?? null}
      partnerName={partnerName}
    />
  );
}
