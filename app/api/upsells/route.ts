// app/api/upsells/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const appointmentId = searchParams.get('appointmentId');
  const leadId = searchParams.get('leadId');

  const where: Record<string, unknown> = {};
  if (appointmentId) where.appointmentId = parseInt(appointmentId);
  if (leadId) where.leadId = parseInt(leadId);

  const upsells = await prisma.upsell.findMany({
    where,
    include: { service: { select: { id: true, title: true, priceValue: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ upsells });
}

export async function POST(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    const upsell = await prisma.upsell.create({
      data: {
        leadId: data.leadId ? parseInt(data.leadId) : undefined,
        appointmentId: data.appointmentId ? parseInt(data.appointmentId) : undefined,
        serviceId: data.serviceId ? parseInt(data.serviceId) : undefined,
        serviceName: String(data.serviceName),
        price: parseFloat(data.price),
        status: data.status || 'offered',
        offeredBy: data.offeredBy || undefined,
      },
    });

    // If accepted, update lead revenue + score
    if (data.status === 'accepted' && data.leadId) {
      await prisma.lead.update({
        where: { id: parseInt(data.leadId) },
        data: {
          totalRevenue: { increment: parseFloat(data.price) },
          lifetimeValue: { increment: parseFloat(data.price) },
          clientScore: { increment: 5 },
        },
      });
    }

    return NextResponse.json({ upsell }, { status: 201 });
  } catch (error) {
    console.error('POST upsell error:', error);
    return NextResponse.json({ error: 'Failed to create upsell' }, { status: 500 });
  }
}

// GET suggestions for a client
export async function PATCH(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clientId, currentServiceId } = await req.json();

  // Get all services
  const services = await prisma.service.findMany({
    where: { id: { not: currentServiceId || 0 }, priceValue: { not: null } },
    select: { id: true, title: true, priceValue: true, description: true },
    orderBy: { order: 'asc' },
    take: 4,
  });

  // Get client history
  let clientData = null;
  if (clientId) {
    clientData = await prisma.lead.findUnique({
      where: { id: parseInt(clientId) },
      select: { clientScore: true, totalServices: true, furnitureType: true, hasPets: true, clientProfile: true },
    });
  }

  const suggestions = services.map((s: { id: number; title: string; priceValue: number | null; description: string }) => ({
    ...s,
    script: `Since we're already here, we can add ${s.title} for just $${s.priceValue}. It'll make a huge difference!`,
    priority: clientData?.clientProfile === 'vip' ? 'high' : 'normal',
  }));

  return NextResponse.json({ suggestions });
}
