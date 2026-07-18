import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { getCurrentUser } from '@/lib/auth';
import { getTripWithAccessCheck } from '@/lib/trip-auth';
import type { IApiResponse } from '@/types';

interface RouteParams {
  params: { tripId: string };
}

const JournalEntrySchema = z.object({
  text: z.string().min(1, 'Write something first 💕'),
  image: z.string().optional()
});

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = JournalEntrySchema.safeParse(body);
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

    trip.sharedJournal.push({
      authorId: session.userId,
      text: parsed.data.text,
      image: parsed.data.image
    });
    await trip.save();

    return NextResponse.json<IApiResponse<typeof trip>>({ success: true, data: trip }, { status: 201 });
  } catch (err) {
    console.error('[JOURNAL_POST_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
