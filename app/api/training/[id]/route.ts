// app/api/training/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = parseInt(params.id);
  const data = await req.json();
  const module = await prisma.trainingModule.update({ where: { id }, data });
  return NextResponse.json({ module });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = parseInt(params.id);
  await prisma.trainingModule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
