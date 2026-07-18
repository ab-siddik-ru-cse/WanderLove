import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { TripCreateForm } from '@/components/forms/TripCreateForm';

export default async function NewTripPage() {
  const session = getCurrentUser();
  await connectDB();
  const user = session ? await User.findById(session.userId).lean() : null;

  return (
    <div>
      <h1 className="mb-6 text-center font-heading text-2xl font-bold">Plan a new trip</h1>
      <TripCreateForm packingTemplates={user?.preferences.packingTemplates ?? []} />
    </div>
  );
}
