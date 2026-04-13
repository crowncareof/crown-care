// app/api/training/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const modules = await prisma.trainingModule.findMany({
    where: { active: true },
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });

  return NextResponse.json({ modules });
}

export async function POST(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { title, category, content, order } = await req.json();
  const module = await prisma.trainingModule.create({
    data: { title, category, content, order: order || 0 },
  });

  return NextResponse.json({ module }, { status: 201 });
}
