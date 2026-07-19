import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { getCurrentUser, comparePassword, hashPassword } from '@/lib/auth';
import type { IApiResponse } from '@/types';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export async function PUT(request: Request) {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(session.userId).select('+password');
    if (!user) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'User not found' }, { status: 404 });
    }

    const isValid = await comparePassword(parsed.data.currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Current password is incorrect' }, { status: 401 });
    }

    user.password = await hashPassword(parsed.data.newPassword);
    await user.save();

    return NextResponse.json<IApiResponse<null>>({ success: true, data: null });
  } catch (err) {
    console.error('[PROFILE_PASSWORD_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
