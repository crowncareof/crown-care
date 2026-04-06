// lib/utils.ts

/** Combines class names, filtering falsy values */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Formats a price string */
export function formatPrice(price: string | null | undefined): string {
  return price || 'Request Quote';
}

/** Truncates text to a maximum length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '…';
}

/** Generates a WhatsApp link */
export function whatsappLink(message?: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '15551234567';
  const text = encodeURIComponent(
    message || 'Hello! I would like to request a quote for upholstery cleaning.'
  );
  return `https://wa.me/${number}?text=${text}`;
}

/** Returns star rating array */
export function getStars(rating: number): ('full' | 'empty')[] {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? 'full' : 'empty'));
}
