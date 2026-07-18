import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { getCurrentUser } from '@/lib/auth';
import { getTripWithAccessCheck } from '@/lib/trip-auth';
import { Mood } from '@/types';
import type { IApiResponse } from '@/types';

interface RouteParams {
  params: { tripId: string; activityId: string };
}

const UpdateActivitySchema = z.object({
  title: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  time: z.string().min(1).optional(),
  cost: z.coerce.number().min(0).optional(),
  currency: z.string().min(1).optional(),
  notes: z.string().optional(),
  image: z.string().optional(),
  mood: z.nativeEnum(Mood).optional(),
  category: z.string().min(1).optional(),
  isSurprise: z.boolean().optional(),
  paidBy: z.string().optional(),
  customFields: z.record(z.string()).optional()
});

function findActivityInTrip(trip: any, activityId: string) {
  for (const day of trip.days) {
    const activity = day.activities.id(activityId);
    if (activity) return { day, activity };
  }
  return null;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = UpdateActivitySchema.safeParse(body);
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

    const found = findActivityInTrip(trip, params.activityId);
    if (!found) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Activity not found' }, { status: 404 });
    }

    Object.assign(found.activity, parsed.data);
    await trip.save();

    return NextResponse.json<IApiResponse<typeof trip>>({ success: true, data: trip });
  } catch (err) {
    console.error('[ACTIVITY_PUT_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { trip, hasAccess } = await getTripWithAccessCheck(params.tripId, session.userId);
    if (!trip) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Trip not found' }, { status: 404 });
    }
    if (!hasAccess) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const found = findActivityInTrip(trip, params.activityId);
    if (!found) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Activity not found' }, { status: 404 });
    }

    found.activity.deleteOne();
    await trip.save();

    return NextResponse.json<IApiResponse<typeof trip>>({ success: true, data: trip });
  } catch (err) {
    console.error('[ACTIVITY_DELETE_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
