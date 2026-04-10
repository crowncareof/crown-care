// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (month && year) {
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    where.scheduledDate = { gte: start, lte: end };
  }
  if (status) where.status = status;

  const appointments = await prisma.appointment.findMany({
    where,
    include: { service: { select: { id: true, title: true } }, lead: { select: { id: true, name: true, clientProfile: true, privateNote: true } } },
    orderBy: { scheduledDate: 'asc' },
  });

  return NextResponse.json({ appointments });
}

export async function POST(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();

    // Risk client check
    if (data.leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: parseInt(data.leadId) }, select: { clientProfile: true } });
      if (lead?.clientProfile === 'risk' && payload.role !== 'admin') {
        return NextResponse.json({ error: 'Admin approval required for risk clients', code: 'RISK_CLIENT' }, { status: 403 });
      }
    }

    // Auto-create Lead if no leadId provided but we have client info
    let leadId = data.leadId ? parseInt(data.leadId) : undefined;
    if (!leadId && data.clientName) {
      // Check if lead already exists by phone
      const existing = data.clientPhone
        ? await prisma.lead.findFirst({ where: { phone: String(data.clientPhone).trim() } })
        : null;

      if (existing) {
        leadId = existing.id;
      } else {
        const newLead = await prisma.lead.create({
          data: {
            name: String(data.clientName).trim(),
            email: data.clientEmail ? String(data.clientEmail).trim() : undefined,
            phone: data.clientPhone ? String(data.clientPhone).trim() : undefined,
            address: data.address ? String(data.address).trim() : undefined,
            status: 'booked',
            source: 'field_visit',
          },
        });
        leadId = newLead.id;
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientName: String(data.clientName || '').trim(),
        clientEmail: data.clientEmail || undefined,
        clientPhone: data.clientPhone || undefined,
        serviceId: data.serviceId ? parseInt(data.serviceId) : undefined,
        leadId,
        scheduledDate: new Date(data.scheduledDate),
        estimatedDuration: data.estimatedDuration ? parseInt(data.estimatedDuration) : 120,
        address: data.address || undefined,
        status: 'pending',
        notes: data.notes || undefined,
        assignedTo: data.assignedTo || undefined,
      },
      include: { service: { select: { id: true, title: true } } },
    });

    return NextResponse.json({ appointment, leadId }, { status: 201 });
  } catch (error) {
    console.error('POST appointments error:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
