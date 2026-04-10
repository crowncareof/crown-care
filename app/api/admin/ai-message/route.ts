// app/api/admin/ai-message/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Simple in-memory rate limiter (resets on cold start — good enough for serverless)
const rateLimitMap = new Map<number, { count: number; resetAt: number }>();

function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkRateLimit(payload.userId)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in 1 hour.' }, { status: 429 });
  }

  try {
    const { clientId } = await req.json();
    if (!clientId) return NextResponse.json({ error: 'clientId is required' }, { status: 400 });

    const client = await prisma.lead.findUnique({
      where: { id: parseInt(clientId) },
      select: {
        name: true, furnitureType: true, fabricType: true,
        hasPets: true, hasChildren: true, totalServices: true,
        lastServiceDate: true, clientProfile: true,
      },
    });

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const now = new Date();
    const daysInactive = client.lastServiceDate
      ? Math.floor((now.getTime() - client.lastServiceDate.getTime()) / (24 * 60 * 60 * 1000))
      : null;

    const toneHint = client.clientProfile === 'vip'
      ? 'This is a loyal VIP client. Be extra warm, appreciative, and personal.'
      : 'Be friendly and professional.';

    const userPrompt = [
      `Client name: ${client.name}`,
      client.furnitureType ? `Furniture cleaned: ${client.furnitureType}` : '',
      client.fabricType ? `Fabric type: ${client.fabricType}` : '',
      client.hasPets ? 'Has pets at home.' : '',
      client.hasChildren ? 'Has children at home.' : '',
      daysInactive ? `Days since last service: ${daysInactive}` : '',
      client.totalServices ? `Total services completed: ${client.totalServices}` : '',
      toneHint,
      'Write a short WhatsApp re-engagement message (max 3 short paragraphs). End with a gentle call to action to book again.',
    ].filter(Boolean).join('\n');

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: 'You are a friendly customer success assistant for Crown Care, a premium upholstery cleaning company in the United States. Write warm, conversational WhatsApp messages in American English. Be personal, reference the client\'s specific situation, and end with a clear but gentle call to action. Never mention internal ratings or notes.',
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const data = await response.json();
    const message = data.content?.[0]?.text;
    if (!message) return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('AI message error:', error);
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
  }
}
