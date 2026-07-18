import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongoose';
import { getTripWithAccessCheck } from '@/lib/trip-auth';
import { User } from '@/models/User';
import { serializeTrip } from '@/lib/serialize';
import { JournalBoard } from '@/components/trip/JournalBoard';

interface TripJournalPageProps {
  params: { tripId: string };
}

export default async function TripJournalPage({ params }: TripJournalPageProps) {
  const session = getCurrentUser();
  if (!session) redirect('/login');

  await connectDB();
  const { trip, hasAccess } = await getTripWithAccessCheck(params.tripId, session.userId);
  if (!trip) notFound();
  if (!hasAccess) redirect('/');

  const serialized = serializeTrip(trip);

  const authorIds = Array.from(new Set(serialized.sharedJournal.map((e) => e.authorId)));
  const authors = await User.find({ _id: { $in: authorIds } }).lean();
  const authorNames = Object.fromEntries(authors.map((a) => [a._id.toString(), a.name]));

  return (
    <JournalBoard
      tripId={params.tripId}
      initialEntries={serialized.sharedJournal}
      currentUserId={session.userId}
      authorNames={authorNames}
    />
  );
}
