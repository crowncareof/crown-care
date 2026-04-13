// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const now = new Date();
  const day30  = new Date(now.getTime() - 30  * 86400000);
  const day60  = new Date(now.getTime() - 60  * 86400000);
  const day90  = new Date(now.getTime() - 90  * 86400000);
  const day365 = new Date(now.getTime() - 365 * 86400000);

  const [
    totalRevenue,
    revenueThisMonth,
    totalClients,
    activeClients,
    vipClients,
    atRiskClients,
    avgSatisfaction,
    upsellStats,
    clientsByStatus,
    clientsByProfile,
    revenueByMonth,
    upsellConversion,
  ] = await Promise.all([
    // Total revenue
    prisma.lead.aggregate({ _sum: { totalRevenue: true } }),
    // Revenue this month
    prisma.lead.aggregate({ where: { lastServiceDate: { gte: day30 } }, _sum: { totalRevenue: true } }),
    // Total clients
    prisma.lead.count(),
    // Active clients (service in last 60d)
    prisma.lead.count({ where: { lastServiceDate: { gte: day60 } } }),
    // VIP
    prisma.lead.count({ where: { clientProfile: 'vip' } }),
    // At risk
    prisma.lead.count({ where: { clientProfile: 'risk' } }),
    // Avg satisfaction
    prisma.lead.aggregate({ where: { satisfactionScore: { not: null } }, _avg: { satisfactionScore: true } }),
    // Upsell stats
    prisma.upsell.groupBy({ by: ['status'], _count: true }),
    // Clients by status
    prisma.lead.groupBy({ by: ['status'], _count: true }),
    // Clients by profile
    prisma.lead.groupBy({ by: ['clientProfile'], _count: true }),
    // Revenue last 6 months (simplified)
    prisma.lead.findMany({
      where: { lastServiceDate: { gte: day365 } },
      select: { lastServiceDate: true, totalRevenue: true },
    }),
    // Upsell conversion rate
    prisma.upsell.count({ where: { status: 'accepted' } }),
  ]);

  // Build monthly revenue buckets
  const monthlyRevenue: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    monthlyRevenue[key] = 0;
  }
  for (const lead of revenueByMonth) {
    if (!lead.lastServiceDate) continue;
    const key = lead.lastServiceDate.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    if (key in monthlyRevenue) monthlyRevenue[key] += lead.totalRevenue;
  }

  const totalUpsells = upsellStats.reduce((s: number, u: { _count: number }) => s + u._count, 0);
  const acceptedUpsells = upsellConversion;

  const retentionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;
  const upsellRate = totalUpsells > 0 ? Math.round((acceptedUpsells / totalUpsells) * 100) : 0;

  return NextResponse.json({
    kpis: {
      totalRevenue: totalRevenue._sum.totalRevenue ?? 0,
      revenueThisMonth: revenueThisMonth._sum.totalRevenue ?? 0,
      totalClients,
      activeClients,
      vipClients,
      atRiskClients,
      avgSatisfaction: Math.round((avgSatisfaction._avg.satisfactionScore ?? 0) * 10) / 10,
      retentionRate,
      upsellRate,
    },
    charts: {
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
      clientsByStatus: clientsByStatus.map((s: { status: string; _count: number }) => ({ status: s.status, count: s._count })),
      clientsByProfile: clientsByProfile.map((p: { clientProfile: string | null; _count: number }) => ({ profile: p.clientProfile ?? 'unknown', count: p._count })),
      upsellBreakdown: upsellStats.map((u: { status: string; _count: number }) => ({ status: u.status, count: u._count })),
    },
  });
}
