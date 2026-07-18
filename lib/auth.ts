import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { IJwtPayload } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '30d';
const AUTH_COOKIE_NAME = 'wanderlove_token';

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function signToken(payload: IJwtPayload): string {
  const options: jwt.SignOptions = { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): IJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as IJwtPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string): void {
  cookies().set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
}

export function clearAuthCookie(): void {
  cookies().set(AUTH_COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export function getAuthTokenFromCookies(): string | undefined {
  return cookies().get(AUTH_COOKIE_NAME)?.value;
}

export function getCurrentUser(): IJwtPayload | null {
  const token = getAuthTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export { AUTH_COOKIE_NAME };
