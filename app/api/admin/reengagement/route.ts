// app/api/admin/reengagement/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const day60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const day90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const clients = await prisma.lead.findMany({
    where: {
      status: 'completed',
      lastServiceDate: { lte: day60 },
    },
    select: {
      id: true, name: true, phone: true, email: true,
      clientProfile: true, lastServiceDate: true,
      furnitureType: true, fabricType: true,
      hasPets: true, hasChildren: true,
      privateNote: true, totalServices: true,
    },
    orderBy: { lastServiceDate: 'asc' },
  });

  interface AlertItem {
    id: number; name: string; phone?: string | null; email?: string | null;
    clientProfile?: string | null; lastServiceDate?: Date | null;
    furnitureType?: string | null; fabricType?: string | null;
    hasPets: boolean; hasChildren: boolean; privateNote?: string | null;
    totalServices: number; daysInactive: number; urgency: string;
  }

  type DBClient = typeof clients[0];
  const alerts: AlertItem[] = clients.map((c: DBClient) => {
    const lastDate = c.lastServiceDate!;
    const daysInactive = Math.floor((now.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
    const urgency = daysInactive >= 90 ? 'red' : 'yellow';
    return { ...c, daysInactive, urgency };
  });

  // VIP first within each group
  const sorted = [
    ...alerts.filter((a: AlertItem) => a.urgency === 'red' && a.clientProfile === 'vip'),
    ...alerts.filter((a: AlertItem) => a.urgency === 'red' && a.clientProfile !== 'vip'),
    ...alerts.filter((a: AlertItem) => a.urgency === 'yellow' && a.clientProfile === 'vip'),
    ...alerts.filter((a: AlertItem) => a.urgency === 'yellow' && a.clientProfile !== 'vip'),
  ];

  return NextResponse.json({ alerts: sorted, total: sorted.length });
}
