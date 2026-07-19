import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import type { IApiResponse, IPublicUser } from '@/types';

const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
  bio: z.string().max(280, 'Keep your bio under 280 characters').optional()
});

function toPublicUser(user: any): IPublicUser {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? null,
    coverImage: user.coverImage ?? null,
    bio: user.bio ?? null,
    partnerId: user.partnerId?.toString() ?? null,
    preferences: user.preferences
  };
}

export async function GET() {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json<IApiResponse<IPublicUser>>({ success: true, data: toPublicUser(user) });
  } catch (err) {
    console.error('[PROFILE_GET_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getCurrentUser();
    if (!session) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<IApiResponse<never>>(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json<IApiResponse<never>>({ success: false, error: 'User not found' }, { status: 404 });
    }

    Object.assign(user, parsed.data);
    await user.save();

    return NextResponse.json<IApiResponse<IPublicUser>>({ success: true, data: toPublicUser(user) });
  } catch (err) {
    console.error('[PROFILE_PUT_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
