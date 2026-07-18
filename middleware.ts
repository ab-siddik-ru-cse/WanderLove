import { NextResponse, type NextRequest } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth-edge';

const AUTH_COOKIE_NAME = 'wanderlove_token';
const PROTECTED_PREFIXES = ['/trips', '/instant', '/settings'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname === '/' || PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifyTokenEdge(token) : null;

  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/trips/:path*', '/instant/:path*', '/settings/:path*']
};
