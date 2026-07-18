import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { getCurrentUser } from '@/lib/auth';
import { getTripWithAccessCheck } from '@/lib/trip-auth';
import { Visibility, ExpenseSplitRule } from '@/types';
import type { IApiResponse } from '@/types';

interface RouteParams {
  params: { tripId: string };
}

// Partial update schema — every field optional, used for editing trip
// details, visibility, budget, or the whole itinerary/journal/packing list.
const UpdateTripSchema = z.object({
  name: z.string().min(2).optional(),
  destination: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  totalBudget: z.coerce.number().min(0).optional(),
  coverImage: z.string().optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  expenseSplitRule: z.nativeEnum(ExpenseSplitRule).optional(),
  packingChecklist: z.array(z.object({ item: z.string(), isPacked: z.boolean() })).optional()
});

export async function GET(_request: Request, { params }: RouteParams) {
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
    if (!hasAccess && trip.visibility !== Visibility.PUBLIC) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json<IApiResponse<typeof trip>>({ success: true, data: trip });
  } catch (err) {
    console.error('[TRIP_GET_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = UpdateTripSchema.safeParse(body);
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

    Object.assign(trip, parsed.data);
    await trip.save();

    return NextResponse.json<IApiResponse<typeof trip>>({ success: true, data: trip });
  } catch (err) {
    console.error('[TRIP_PUT_ERROR]', err);
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
    // Only the original creator can delete the trip, not just any collaborator.
    if (trip.createdBy.toString() !== session.userId) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: 'Only the trip creator can delete it' },
        { status: 403 }
      );
    }
    void hasAccess;

    await trip.deleteOne();

    return NextResponse.json<IApiResponse<null>>({ success: true, data: null });
  } catch (err) {
    console.error('[TRIP_DELETE_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
