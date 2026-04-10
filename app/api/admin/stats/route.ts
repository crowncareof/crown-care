// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const now = new Date();
  const day60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [services, portfolio, testimonials, leads, completedClients,
    pendingAppointments, reengagementAlerts, vipClients, recentLeads] = await Promise.all([
    prisma.service.count(),
    prisma.portfolio.count(),
    prisma.testimonial.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'completed' } }),
    prisma.appointment.count({ where: { status: 'pending' } }),
    prisma.lead.count({ where: { status: 'completed', lastServiceDate: { lte: day60 } } }),
    prisma.lead.count({ where: { clientProfile: 'vip' } }),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, phone: true, service: true, status: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    stats: { services, portfolio, testimonials, leads, completedClients, pendingAppointments, reengagementAlerts, vipClients },
    recentLeads,
  });
}
