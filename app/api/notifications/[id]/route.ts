// app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  const { status, snoozedUntil } = await req.json();

  const notification = await prisma.notification.update({
    where: { id },
    data: {
      status,
      ...(snoozedUntil && { snoozedUntil: new Date(snoozedUntil) }),
    },
  });

  return NextResponse.json({ notification });
}
