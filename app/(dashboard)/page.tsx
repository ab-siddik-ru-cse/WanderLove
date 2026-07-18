import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongoose';
import { Trip } from '@/models/Trip';
import { CountdownWidget } from '@/components/trip/CountdownWidget';
import { TripCard } from '@/components/trip/TripCard';
import { Button } from '@/components/ui/Button';

export default async function DashboardPage() {
  const session = getCurrentUser();
  await connectDB();

  // Fetch trips the user created OR was added to as a collaborator (partner).
  const trips = await Trip.find({
    $or: [{ createdBy: session?.userId }, { collaborators: session?.userId }]
  })
    .sort({ startDate: 1 })
    .lean();

  const now = Date.now();
  const nearestUpcoming = trips.find((trip) => new Date(trip.startDate).getTime() > now);

  return (
    <div className="mx-auto max-w-6xl">
      {nearestUpcoming && (
        <div className="mb-8 max-w-sm">
          <CountdownWidget
            targetDate={new Date(nearestUpcoming.startDate).toISOString()}
            destination={nearestUpcoming.destination}
            coverImage={nearestUpcoming.coverImage}
          />
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ink">Your Trips 🗺️</h1>
      </div>

      {trips.length === 0 ? (
        <div className="card-surface flex flex-col items-center gap-4 py-16 text-center">
          <Heart className="h-10 w-10 fill-primary/20 text-primary" />
          <div>
            <p className="font-heading text-xl font-semibold text-ink">No adventures planned yet</p>
            <p className="mt-1 text-sm text-ink/50">Start your first trip together and watch the countdown begin.</p>
          </div>
          <Link href="/trips/new">
            <Button>
              <Plus className="h-4 w-4" />
              Plan your first trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard
              key={trip._id.toString()}
              trip={{
                _id: trip._id.toString(),
                name: trip.name,
                destination: trip.destination,
                country: trip.country,
                startDate: new Date(trip.startDate).toISOString(),
                endDate: new Date(trip.endDate).toISOString(),
                coverImage: trip.coverImage,
                totalBudget: trip.totalBudget,
                currency: trip.currency
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
