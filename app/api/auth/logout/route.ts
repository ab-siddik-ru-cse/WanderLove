import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import type { IApiResponse } from '@/types';

export async function POST() {
  clearAuthCookie();
  return NextResponse.json<IApiResponse<null>>({ success: true, data: null });
}
