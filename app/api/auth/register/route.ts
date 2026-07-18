import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import type { IApiResponse, IPublicUser } from '@/types';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json<IApiResponse<never>>({ success: false, error: message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, password: hashed });

    const token = signToken({ userId: user._id.toString(), email: user.email });
    setAuthCookie(token);

    const publicUser: IPublicUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      partnerId: user.partnerId?.toString() ?? null,
      preferences: user.preferences
    };

    return NextResponse.json<IApiResponse<IPublicUser>>({ success: true, data: publicUser }, { status: 201 });
  } catch (err) {
    console.error('[REGISTER_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
