// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, active: true },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (!user.active) return NextResponse.json({ error: 'Account deactivated' }, { status: 403 });

  return NextResponse.json({ user });
}
