import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import type { IApiResponse, IPublicUser } from '@/types';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json<IApiResponse<never>>({ success: false, error: message }, { status: 400 });
    }

    const { email, password } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });
    setAuthCookie(token);

    const publicUser: IPublicUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null,
      coverImage: user.coverImage ?? null,
      bio: user.bio ?? null,
      partnerId: user.partnerId?.toString() ?? null,
      preferences: user.preferences
    };

    return NextResponse.json<IApiResponse<IPublicUser>>({ success: true, data: publicUser });
  } catch (err) {
    console.error('[LOGIN_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
