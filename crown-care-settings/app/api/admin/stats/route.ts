// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [services, portfolio, testimonials, leads, recentLeads] = await Promise.all([
    prisma.service.count(),
    prisma.portfolio.count(),
    prisma.testimonial.count(),
    prisma.lead.count(),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, service: true, status: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({ stats: { services, portfolio, testimonials, leads }, recentLeads });
}
