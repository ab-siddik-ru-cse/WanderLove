import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { getCurrentUser } from '@/lib/auth';
import { getTripWithAccessCheck } from '@/lib/trip-auth';
import type { IApiResponse } from '@/types';

interface RouteParams {
  params: { tripId: string };
}

// The client sends, per day, the ordered list of activity IDs currently
// in that day column (an activity may have moved from another day's
// column during drag-and-drop — that's why we key by dayId -> activityIds
// rather than a single flat array).
const ReorderSchema = z.object({
  days: z.array(
    z.object({
      dayId: z.string(),
      activityIds: z.array(z.string())
    })
  )
});

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ReorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    await connectDB();
    const { trip, hasAccess } = await getTripWithAccessCheck(params.tripId, session.userId);
    if (!trip) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Trip not found' }, { status: 404 });
    }
    if (!hasAccess) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Build a lookup of every activity currently in the trip, regardless
    // of which day it's under right now, keyed by its _id.
    const activityLookup = new Map<string, any>();
    for (const day of trip.days) {
      for (const activity of day.activities) {
        activityLookup.set(activity._id.toString(), activity.toObject());
      }
    }

    for (const { dayId, activityIds } of parsed.data.days) {
      const day = trip.days.id(dayId);
      if (!day) continue;

      const reordered = activityIds
        .map((id) => activityLookup.get(id))
        .filter((activity): activity is NonNullable<typeof activity> => Boolean(activity))
        .map((activity, index) => ({ ...activity, date: day.date, order: index }));

      day.activities.splice(0, day.activities.length);
      reordered.forEach((activity) => day.activities.push(activity));
    }

    await trip.save();

    return NextResponse.json<IApiResponse<typeof trip>>({ success: true, data: trip });
  } catch (err) {
    console.error('[ACTIVITY_REORDER_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
