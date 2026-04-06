// lib/utils.ts

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPrice(price: string | null | undefined): string {
  return price || 'Request Quote';
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '…';
}

export function whatsappLink(message?: string, number?: string): string {
  const num = number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '15551234567';
  const text = encodeURIComponent(
    message || 'Hello! I would like to request a quote for upholstery cleaning.'
  );
  return `https://wa.me/${num}?text=${text}`;
}

export function getStars(rating: number): ('full' | 'empty')[] {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? 'full' : 'empty'));
}
