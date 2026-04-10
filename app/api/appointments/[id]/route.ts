// app/api/appointments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  const data = await req.json();

  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(data.clientName && { clientName: String(data.clientName).trim() }),
        ...(data.clientEmail !== undefined && { clientEmail: data.clientEmail }),
        ...(data.clientPhone !== undefined && { clientPhone: data.clientPhone }),
        ...(data.serviceId && { serviceId: parseInt(data.serviceId) }),
        ...(data.scheduledDate && { scheduledDate: new Date(data.scheduledDate) }),
        ...(data.estimatedDuration && { estimatedDuration: parseInt(data.estimatedDuration) }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
      },
      include: { service: { select: { id: true, title: true } }, lead: { select: { id: true, name: true, clientProfile: true } } },
    });

    // Side effects on completion
    if (data.status === 'completed' && appointment.leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: appointment.leadId },
        select: { totalServices: true, clientProfile: true },
      });
      if (lead) {
        const newTotal = (lead.totalServices || 0) + 1;
        await prisma.lead.update({
          where: { id: appointment.leadId },
          data: {
            lastServiceDate: new Date(),
            totalServices: newTotal,
            status: 'completed',
            ...(data.serviceValue && { serviceValue: parseFloat(data.serviceValue) }),
          },
        });
      }
    }

    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = parseInt(params.id);
  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
