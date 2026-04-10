// app/api/clients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

// Internal-only fields never returned to public
const SAFE_SELECT = {
  id: true, name: true, email: true, phone: true, address: true,
  preferredContact: true, furnitureType: true, fabricType: true,
  hasPets: true, hasChildren: true, protectionApplied: true,
  service: true, status: true, source: true, lastServiceDate: true,
  totalServices: true, totalRevenue: true, serviceValue: true,
  clientProfile: true, satisfactionScore: true, internalFlags: true,
  privateNote: true, beforePhotoUrl: true, afterPhotoUrl: true,
  message: true, createdAt: true, updatedAt: true,
};

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const clientProfile = searchParams.get('clientProfile') || '';
  const source = searchParams.get('source') || '';

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status;
  if (clientProfile) where.clientProfile = clientProfile;
  if (source) where.source = source;

  const [clients, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      select: SAFE_SELECT,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ clients, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    // Sanitize — never allow internalFlags injection from collaborators
    const safe = {
      name: String(data.name || '').trim(),
      email: data.email ? String(data.email).trim() : undefined,
      phone: data.phone ? String(data.phone).trim() : undefined,
      address: data.address ? String(data.address).trim() : undefined,
      preferredContact: data.preferredContact || 'whatsapp',
      furnitureType: data.furnitureType || undefined,
      fabricType: data.fabricType || undefined,
      hasPets: Boolean(data.hasPets),
      hasChildren: Boolean(data.hasChildren),
      protectionApplied: Boolean(data.protectionApplied),
      service: data.service || undefined,
      message: data.message ? String(data.message).trim() : undefined,
      status: data.status || 'new_lead',
      source: data.source || 'website',
      serviceValue: data.serviceValue ? parseFloat(data.serviceValue) : undefined,
      clientProfile: data.clientProfile || undefined,
      satisfactionScore: data.satisfactionScore ? parseInt(data.satisfactionScore) : undefined,
      internalFlags: data.internalFlags || undefined,
      privateNote: data.privateNote ? String(data.privateNote).trim() : undefined,
    };
    if (!safe.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const client = await prisma.lead.create({ data: safe, select: SAFE_SELECT });
    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('POST clients error:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
