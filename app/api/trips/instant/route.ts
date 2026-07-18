import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/models/User';
import { Trip } from '@/models/Trip';
import { Template } from '@/models/Template';
import { Visibility } from '@/types';
import type { IApiResponse } from '@/types';

const InstantPlanSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  days: z.coerce.number().int().min(1, 'At least 1 day').max(30, 'Max 30 days'),
  totalBudget: z.coerce.number().min(0, 'Budget cannot be negative'),
  mood: z.enum(['romantic', 'adventure', 'relax'])
});

// Very lightweight keyword heuristic to classify free-text destinations
// into one of the template categories, since the Instant Plan form only
// asks for a destination name (not a formal type).
function guessDestinationType(destination: string): 'beach' | 'mountain' | 'city' {
  const text = destination.toLowerCase();
  const beachWords = ['beach', 'coast', 'island', 'sea', 'bay', "cox's bazar", 'coxs bazar', 'sundarban'];
  const mountainWords = ['mountain', 'hill', 'hiking', 'alps', 'trek', 'bandarban', 'sajek', 'sylhet'];

  if (beachWords.some((w) => text.includes(w))) return 'beach';
  if (mountainWords.some((w) => text.includes(w))) return 'mountain';
  return 'city';
}

export async function POST(request: Request) {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = InstantPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const { destination, days, totalBudget, mood } = parsed.data;
    const destinationType = guessDestinationType(destination);

    await connectDB();

    const currentUser = await User.findById(session.userId);
    if (!currentUser) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Best match first, then relax the filter progressively so we always
    // return *something* even if the seed data is sparse.
    let templates = await Template.find({ mood, destinationType });
    if (templates.length === 0) templates = await Template.find({ mood });
    if (templates.length === 0) templates = await Template.find({ destinationType });
    if (templates.length === 0) templates = await Template.find({});

    const pooledActivities = templates.flatMap((t) => t.activities);

    // Trip starts a week from now by default — the person can edit dates afterward.
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    startDate.setHours(0, 0, 0, 0);

    const dayDocs = Array.from({ length: days }).map((_, dayIndex) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + dayIndex);

      // Spread 2-3 activities per day across the available pool, cycling
      // through it if the pool is smaller than needed.
      const activitiesForDay =
        pooledActivities.length > 0
          ? Array.from({ length: Math.min(3, pooledActivities.length) })
              .map((__, i) => pooledActivities[(dayIndex * 3 + i) % pooledActivities.length])
              .filter((template): template is NonNullable<typeof template> => Boolean(template))
              .map((template) => ({
                title: template.title,
                location: template.location,
                time: template.time,
                date,
                cost: template.cost,
                currency: 'BDT',
                category: template.category,
                isSurprise: false,
                customFields: {},
                order: 0
              }))
              .map((activity, index) => ({ ...activity, order: index }))
          : [];

      return { date, activities: activitiesForDay };
    });

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1);

    const trip = await Trip.create({
      name: `${mood.charAt(0).toUpperCase() + mood.slice(1)} trip to ${destination}`,
      destination,
      country: '',
      startDate,
      endDate,
      timezone: 'Asia/Dhaka',
      currency: 'BDT',
      totalBudget,
      visibility: Visibility.PARTNER,
      createdBy: currentUser._id,
      isInstant: true,
      collaborators: currentUser.partnerId ? [currentUser.partnerId] : [],
      days: dayDocs,
      sharedJournal: [],
      packingChecklist: [],
      expenseSplitRule: currentUser.preferences.defaultSplitRule
    });

    return NextResponse.json<IApiResponse<{ tripId: string }>>(
      { success: true, data: { tripId: trip._id.toString() } },
      { status: 201 }
    );
  } catch (err) {
    console.error('[INSTANT_PLAN_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
