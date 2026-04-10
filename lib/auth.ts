// lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export function signToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: 604800 });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET!;
    return jwt.verify(token, secret) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7);
  return req.cookies.get('crown_token')?.value || null;
}

export function authenticate(req: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAdmin(req: NextRequest): JWTPayload | null {
  const payload = authenticate(req);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}
