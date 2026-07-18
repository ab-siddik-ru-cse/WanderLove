import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { ExpenseSplitRule } from '@/types';
import type { IApiResponse, IUserPreferences } from '@/types';

const PreferencesSchema = z.object({
  theme: z
    .object({
      primary: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Must be a hex color like #E85D75'),
      secondary: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Must be a hex color like #6C63FF'),
      font: z.string()
    })
    .optional(),
  defaultCurrency: z.string().min(1).optional(),
  customCategories: z.array(z.string().min(1)).optional(),
  customActivityFields: z
    .array(z.object({ fieldName: z.string().min(1), fieldType: z.enum(['text', 'number', 'date']) }))
    .optional(),
  packingTemplates: z.array(z.object({ name: z.string().min(1), items: z.array(z.string()) })).optional(),
  defaultSplitRule: z.nativeEnum(ExpenseSplitRule).optional()
});

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

    return NextResponse.json<IApiResponse<IUserPreferences>>({ success: true, data: user.preferences });
  } catch (err) {
    console.error('[SETTINGS_GET_ERROR]', err);
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
    const parsed = PreferencesSchema.safeParse(body);
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

    Object.assign(user.preferences, parsed.data);
    await user.save();

    return NextResponse.json<IApiResponse<IUserPreferences>>({ success: true, data: user.preferences });
  } catch (err) {
    console.error('[SETTINGS_PUT_ERROR]', err);
    return NextResponse.json<IApiResponse<never>>({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
