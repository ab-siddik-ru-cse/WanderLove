import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { generatePartnerCode } from '@/lib/utils';
import type { IApiResponse } from '@/types';

// Returns the current user's partner-link code, generating one if it
// doesn't exist yet. If a partner is already linked, returns an error
// since only one partner is allowed at a time.
export async function GET() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(currentUser.userId);

    if (!user) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (user.partnerId) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: 'You already have a partner linked' },
        { status: 409 }
      );
    }

    if (!user.partnerLinkCode) {
      // Regenerate on collision, extremely unlikely but handled anyway.
      let code = generatePartnerCode();
      // eslint-disable-next-line no-await-in-loop
      while (await User.findOne({ partnerLinkCode: code })) {
        code = generatePartnerCode();
      }
      user.partnerLinkCode = code;
      await user.save();
    }

    return NextResponse.json<IApiResponse<{ code: string }>>({
      success: true,
      data: { code: user.partnerLinkCode as string }
    });
  } catch (err) {
    console.error('[PARTNER_LINK_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
