// app/api/portfolio/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { deleteImage } from '@/lib/cloudinary';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  const item = await prisma.portfolio.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  const data = await req.json();

  try {
    const item = await prisma.portfolio.update({ where: { id }, data });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  const item = await prisma.portfolio.findUnique({ where: { id } });

  if (item?.beforePublicId) await deleteImage(item.beforePublicId).catch(console.error);
  if (item?.afterPublicId) await deleteImage(item.afterPublicId).catch(console.error);

  await prisma.portfolio.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
