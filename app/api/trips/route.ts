import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { Trip } from '@/models/Trip';
import { User } from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { getDaysBetween } from '@/lib/utils';
import { Visibility } from '@/types';
import type { IApiResponse } from '@/types';

const CreateTripSchema = z
  .object({
    name: z.string().min(2, 'Trip name is required'),
    destination: z.string().min(1, 'Destination is required'),
    country: z.string().min(1, 'Country is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    timezone: z.string().min(1).default('Asia/Dhaka'),
    currency: z.string().min(1).default('BDT'),
    totalBudget: z.coerce.number().min(0, 'Budget cannot be negative'),
    visibility: z.nativeEnum(Visibility).default(Visibility.PARTNER),
    packingTemplateName: z.string().optional()
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after the start date',
    path: ['endDate']
  });

export async function GET() {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const trips = await Trip.find({
      $or: [{ createdBy: session.userId }, { collaborators: session.userId }]
    })
      .sort({ startDate: 1 })
      .lean();

    return NextResponse.json<IApiResponse<typeof trips>>({ success: true, data: trips });
  } catch (err) {
    console.error('[TRIPS_GET_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateTripSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const { name, destination, country, startDate, endDate, timezone, currency, totalBudget, visibility, packingTemplateName } =
      parsed.data;

    await connectDB();

    const currentUser = await User.findById(session.userId);
    if (!currentUser) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Auto-generate one day-column per calendar day of the trip.
    const days = getDaysBetween(new Date(startDate), new Date(endDate)).map((date) => ({
      date,
      activities: []
    }));

    // Pull in the selected packing template's items, if any.
    let packingChecklist: { item: string; isPacked: boolean }[] = [];
    if (packingTemplateName) {
      const template = currentUser.preferences.packingTemplates.find((t) => t.name === packingTemplateName);
      if (template) {
        packingChecklist = template.items.map((item) => ({ item, isPacked: false }));
      }
    }

    const trip = await Trip.create({
      name,
      destination,
      country,
      startDate,
      endDate,
      timezone,
      currency,
      totalBudget,
      visibility,
      createdBy: currentUser._id,
      isInstant: false,
      // A couple's trip automatically includes the linked partner, if any.
      collaborators: currentUser.partnerId ? [currentUser.partnerId] : [],
      days,
      sharedJournal: [],
      packingChecklist,
      expenseSplitRule: currentUser.preferences.defaultSplitRule
    });

    return NextResponse.json<IApiResponse<{ tripId: string }>>(
      { success: true, data: { tripId: trip._id.toString() } },
      { status: 201 }
    );
  } catch (err) {
    console.error('[TRIPS_POST_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
