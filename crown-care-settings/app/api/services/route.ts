// app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET() {
  try {
    const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json({ services });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Both admin and collaborator can create
  try {
    const data = await req.json();
    const service = await prisma.service.create({ data });
    return NextResponse.json({ service }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
