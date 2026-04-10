// app/api/visit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();

    if (!data.name || !data.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    // Process flags
    let flags: string[] = [];
    try { flags = JSON.parse(data.internalFlags || '[]'); } catch { flags = []; }

    let satisfactionScore = data.satisfactionScore ? parseInt(data.satisfactionScore) : undefined;
    if (flags.includes('tippedTechnician') && satisfactionScore) {
      satisfactionScore = Math.min(5, satisfactionScore + 1);
    }

    const visitData = {
      name: String(data.name).trim(),
      phone: String(data.phone).trim(),
      preferredContact: data.preferredContact || 'whatsapp',
      furnitureType: data.furnitureType || undefined,
      fabricType: data.fabricType || undefined,
      hasPets: Boolean(data.hasPets),
      hasChildren: Boolean(data.hasChildren),
      protectionApplied: Boolean(data.protectionApplied),
      serviceValue: data.serviceValue ? parseFloat(data.serviceValue) : undefined,
      satisfactionScore,
      clientProfile: data.clientProfile || undefined,
      internalFlags: flags.length > 0 ? JSON.stringify(flags) : undefined,
      privateNote: data.privateNote ? String(data.privateNote).trim() : undefined,
      status: 'completed' as const,
      lastServiceDate: new Date(),
    };

    // Upsert by phone
    const existing = await prisma.lead.findFirst({ where: { phone: visitData.phone } });

    let lead;
    if (existing) {
      lead = await prisma.lead.update({
        where: { id: existing.id },
        data: { ...visitData, totalServices: { increment: 1 } },
      });
    } else {
      lead = await prisma.lead.create({ data: { ...visitData, totalServices: 1, source: 'field_visit' } });
    }

    // leftReview side effect
    if (flags.includes('leftReview')) {
      await prisma.testimonial.create({
        data: { name: visitData.name, comment: 'Pending review from client visit', rating: satisfactionScore || 5, featured: false, status: 'pending' },
      }).catch(() => {});
    }
    // referredSomeone → update source
    if (flags.includes('referredSomeone') && existing) {
      await prisma.lead.update({ where: { id: lead.id }, data: { source: 'referral' } }).catch(() => {});
    }

    return NextResponse.json({ success: true, lead: { id: lead.id, name: lead.name } }, { status: 201 });
  } catch (error) {
    console.error('Visit form error:', error);
    return NextResponse.json({ error: 'Failed to save visit' }, { status: 500 });
  }
}
