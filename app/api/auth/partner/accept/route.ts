import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import type { IApiResponse } from '@/types';

const AcceptSchema = z.object({
  code: z.string().min(1, 'Code is required')
});

export async function POST(request: Request) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = AcceptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid code' },
        { status: 400 }
      );
    }

    await connectDB();

    const me = await User.findById(currentUser.userId);
    if (!me) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (me.partnerId) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: 'You already have a partner linked' },
        { status: 409 }
      );
    }

    const partner = await User.findOne({ partnerLinkCode: parsed.data.code.trim() });
    if (!partner) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Invalid or expired code' }, { status: 404 });
    }
    if (partner._id.toString() === me._id.toString()) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: "You can't link with yourself 💔" },
        { status: 400 }
      );
    }
    if (partner.partnerId) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: 'This person already has a partner linked' },
        { status: 409 }
      );
    }

    // Link both ways, then clear codes since only one partner is allowed.
    me.partnerId = partner._id;
    me.partnerLinkCode = null;
    partner.partnerId = me._id;
    partner.partnerLinkCode = null;

    await Promise.all([me.save(), partner.save()]);

    return NextResponse.json<IApiResponse<{ partnerName: string }>>({
      success: true,
      data: { partnerName: partner.name }
    });
  } catch (err) {
    console.error('[PARTNER_ACCEPT_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
