// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'unread';

  const where: Record<string, unknown> = {};
  if (status !== 'all') where.status = status;

  const notifications = await prisma.notification.findMany({
    where,
    include: { lead: { select: { id: true, name: true, phone: true, clientProfile: true } } },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    take: 50,
  });

  const unreadCount = await prisma.notification.count({ where: { status: 'unread' } });

  return NextResponse.json({ notifications, unreadCount });
}

// POST — generate smart notifications
export async function POST(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const now = new Date();
  const day30 = new Date(now.getTime() - 30 * 86400000);
  const day7  = new Date(now.getTime() - 7  * 86400000);
  const created: number[] = [];

  // 1. Inactive 30+ days
  const inactive = await prisma.lead.findMany({
    where: { status: 'completed', lastServiceDate: { lte: day30 } },
    select: { id: true, name: true, clientProfile: true },
  });

  for (const client of inactive) {
    const exists = await prisma.notification.findFirst({
      where: { leadId: client.id, type: 'inactive', createdAt: { gte: day7 } },
    });
    if (!exists) {
      const n = await prisma.notification.create({
        data: {
          leadId: client.id,
          type: 'inactive',
          title: `${client.name} hasn't been serviced in 30+ days`,
          message: 'Consider sending a re-engagement message.',
          priority: client.clientProfile === 'vip' ? 'high' : 'medium',
        },
      });
      created.push(n.id);
    }
  }

  // 2. Missing data
  const missingData = await prisma.lead.findMany({
    where: { OR: [{ phone: null }, { email: null }, { clientProfile: null }] },
    select: { id: true, name: true },
    take: 20,
  });

  for (const client of missingData) {
    const exists = await prisma.notification.findFirst({
      where: { leadId: client.id, type: 'missing_data', status: 'unread' },
    });
    if (!exists) {
      const n = await prisma.notification.create({
        data: {
          leadId: client.id,
          type: 'missing_data',
          title: `Incomplete profile: ${client.name}`,
          message: 'Phone, email, or profile classification is missing.',
          priority: 'low',
        },
      });
      created.push(n.id);
    }
  }

  // 3. VIP unattended (no service in 45 days)
  const day45 = new Date(now.getTime() - 45 * 86400000);
  const vipUnattended = await prisma.lead.findMany({
    where: { clientProfile: 'vip', lastServiceDate: { lte: day45 } },
    select: { id: true, name: true },
  });

  for (const client of vipUnattended) {
    const exists = await prisma.notification.findFirst({
      where: { leadId: client.id, type: 'vip_unattended', createdAt: { gte: day7 } },
    });
    if (!exists) {
      const n = await prisma.notification.create({
        data: {
          leadId: client.id,
          type: 'vip_unattended',
          title: `⭐ VIP client ${client.name} needs attention`,
          message: 'This VIP client hasn\'t been serviced in 45+ days.',
          priority: 'critical',
        },
      });
      created.push(n.id);
    }
  }

  return NextResponse.json({ created: created.length, ids: created });
}
