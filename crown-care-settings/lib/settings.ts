// lib/settings.ts
import { prisma } from '@/lib/prisma';

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany();
    return Object.fromEntries(rows.map((s: { key: string; value: string }) => [s.key, s.value]));
  } catch {
    return {};
  }
}
