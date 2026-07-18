import { jwtVerify } from 'jose';
import type { IJwtPayload } from '@/types';

// Next.js middleware runs on the Edge runtime, which does not support
// Node's `crypto` module (used internally by the `jsonwebtoken` package).
// `jose` is pure Web Crypto API based, so it works here. API routes still
// use `jsonwebtoken` via lib/auth.ts since those run on the Node runtime.
const encodedSecret = new TextEncoder().encode(process.env.JWT_SECRET as string);

export async function verifyTokenEdge(token: string): Promise<IJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as unknown as IJwtPayload;
  } catch {
    return null;
  }
}
