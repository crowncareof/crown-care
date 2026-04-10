// app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

type Params = { params: { id: string } };

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

export async function GET(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id);
  const client = await prisma.lead.findUnique({ where: { id }, select: SAFE_SELECT });
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ client });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  const data = await req.json();

  // Process flag side effects
  const updateData: Record<string, unknown> = { ...data };

  if (data.internalFlags) {
    let flags: string[] = [];
    try { flags = JSON.parse(data.internalFlags); } catch { flags = []; }

    // referredSomeone → set source to referral
    if (flags.includes('referredSomeone') && data.source !== 'referral') {
      updateData.source = 'referral';
    }
    // tippedTechnician → bump satisfactionScore
    if (flags.includes('tippedTechnician')) {
      const existing = await prisma.lead.findUnique({ where: { id }, select: { satisfactionScore: true } });
      const current = existing?.satisfactionScore ?? 3;
      updateData.satisfactionScore = Math.min(5, current + 1);
    }
    // leftReview → create pending testimonial
    if (flags.includes('leftReview')) {
      const existing = await prisma.lead.findUnique({ where: { id }, select: { name: true } });
      if (existing) {
        await prisma.testimonial.create({
          data: {
            name: existing.name,
            comment: 'Pending review from client visit',
            rating: 5,
            featured: false,
            status: 'pending',
          },
        }).catch(() => {}); // non-blocking
      }
    }
  }

  try {
    const client = await prisma.lead.update({ where: { id }, data: updateData, select: SAFE_SELECT });
    return NextResponse.json({ client });
  } catch {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = parseInt(params.id);
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
