import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongoose';
import { getTripWithAccessCheck } from '@/lib/trip-auth';
import { User } from '@/models/User';
import { serializeTrip } from '@/lib/serialize';
import { computeCategoryTotals, computeDayTotals, computeSettlement } from '@/lib/budget';
import { BudgetCharts } from '@/components/trip/BudgetCharts';

interface TripBudgetPageProps {
  params: { tripId: string };
}

export default async function TripBudgetPage({ params }: TripBudgetPageProps) {
  const session = getCurrentUser();
  if (!session) redirect('/login');

  await connectDB();
  const { trip, hasAccess } = await getTripWithAccessCheck(params.tripId, session.userId);
  if (!trip) notFound();
  if (!hasAccess) redirect('/');

  const serialized = serializeTrip(trip);

  let partnerName: string | null = null;
  const partnerId = serialized.collaborators.find((id) => id !== serialized.createdBy) ?? null;
  if (partnerId) {
    const partner = await User.findById(partnerId).lean();
    partnerName = partner?.name ?? null;
  }

  const categoryTotals = computeCategoryTotals(serialized);
  const dayTotals = computeDayTotals(serialized);
  const settlement = computeSettlement(serialized, partnerId);

  return (
    <BudgetCharts
      currency={serialized.currency}
      totalBudget={serialized.totalBudget}
      categoryTotals={categoryTotals}
      dayTotals={dayTotals}
      settlement={settlement}
      partnerName={partnerName}
    />
  );
}
