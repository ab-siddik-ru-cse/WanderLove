import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { getCurrentUser } from '@/lib/auth';
import { getTripWithAccessCheck } from '@/lib/trip-auth';
import { Mood } from '@/types';
import type { IApiResponse } from '@/types';

interface RouteParams {
  params: { tripId: string };
}

const AddActivitySchema = z.object({
  dayId: z.string().min(1, 'dayId is required'),
  title: z.string().min(1, 'Title is required'),
  location: z.string().min(1, 'Location is required'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  time: z.string().min(1, 'Time is required'),
  cost: z.coerce.number().min(0).default(0),
  currency: z.string().min(1).default('BDT'),
  notes: z.string().optional(),
  image: z.string().optional(),
  mood: z.nativeEnum(Mood).optional(),
  category: z.string().min(1).default('General'),
  isSurprise: z.boolean().default(false),
  paidBy: z.string().optional(),
  customFields: z.record(z.string()).default({})
});

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = AddActivitySchema.safeParse(body);
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

    const day = trip.days.id(parsed.data.dayId);
    if (!day) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Day not found in this trip' }, { status: 404 });
    }

    const { dayId, ...activityData } = parsed.data;
    void dayId;

    day.activities.push({
      ...activityData,
      date: day.date,
      order: day.activities.length
    });

    await trip.save();

    return NextResponse.json<IApiResponse<typeof trip>>({ success: true, data: trip }, { status: 201 });
  } catch (err) {
    console.error('[ACTIVITY_POST_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
