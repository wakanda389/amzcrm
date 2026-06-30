export function detectCardBrand(card: string): { brand: string; last4: string } {
  const c = (card || '').trim();
  const last4Match = c.match(/(\d{4})\s*$/);
  const last4 = last4Match ? last4Match[1] : '';
  const lower = c.toLowerCase();
  let brand = 'Card';
  if (lower.includes('visa')) brand = 'Visa';
  else if (lower.includes('master')) brand = 'Mastercard';
  else if (lower.includes('amex') || lower.includes('american')) brand = 'Amex';
  else if (lower.includes('jcb')) brand = 'JCB';
  else if (lower.includes('discover')) brand = 'Discover';
  else if (lower.includes('napas')) brand = 'Napas';
  return { brand, last4 };
}

export const BRAND_STYLES: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  Visa: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200', label: 'VISA' },
  Mastercard: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200', label: 'MC' },
  Amex: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', label: 'AMEX' },
  JCB: { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', label: 'JCB' },
  Discover: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', label: 'DISC' },
  Napas: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200', label: 'NAPAS' },
  Card: { bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-200', label: 'CARD' },
};
