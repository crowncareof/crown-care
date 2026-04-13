// app/api/performance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const performances = await prisma.performance.findMany({
    where: { month, year },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { revenueGenerated: 'desc' },
  });

  // Enrich with upsell data from upsells table
  const enriched = await Promise.all(performances.map(async (p: typeof performances[0]) => {
    const upsellData = await prisma.upsell.findMany({
      where: {
        offeredBy: p.user.name,
        createdAt: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) },
      },
    });
    const offered = upsellData.length;
    const accepted = upsellData.filter((u: { status: string }) => u.status === 'accepted').length;
    const rate = offered > 0 ? Math.round((accepted / offered) * 100) : 0;

    return {
      ...p,
      upsellOffered: offered,
      upsellAccepted: accepted,
      upsellRate: rate,
      badge: rate >= 70 ? 'Top Seller' : p.visitsCompleted >= 20 ? 'High Performer' : null,
    };
  }));

  return NextResponse.json({ performances: enriched, month, year });
}

export async function POST(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { userId, month, year, revenueGenerated, visitsCompleted } = await req.json();
    const performance = await prisma.performance.upsert({
      where: { userId_month_year: { userId: parseInt(userId), month: parseInt(month), year: parseInt(year) } },
      update: {
        revenueGenerated: { increment: parseFloat(revenueGenerated || 0) },
        visitsCompleted: { increment: parseInt(visitsCompleted || 0) },
      },
      create: {
        userId: parseInt(userId),
        month: parseInt(month),
        year: parseInt(year),
        revenueGenerated: parseFloat(revenueGenerated || 0),
        visitsCompleted: parseInt(visitsCompleted || 0),
      },
    });
    return NextResponse.json({ performance });
  } catch (error) {
    console.error('POST performance error:', error);
    return NextResponse.json({ error: 'Failed to update performance' }, { status: 500 });
  }
}
