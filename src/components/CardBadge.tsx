import { CreditCard } from 'lucide-react';
import { detectCardBrand, BRAND_STYLES } from '../lib/card';

interface Props {
  card: string;
  size?: 'sm' | 'md';
}

export default function CardBadge({ card, size = 'sm' }: Props) {
  if (!card || !card.trim()) {
    return <span className="text-slate-300">—</span>;
  }
  const { brand, last4 } = detectCardBrand(card);
  const style = BRAND_STYLES[brand] ?? BRAND_STYLES.Card;
  const pad = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg ${style.bg} ${style.text} ring-1 ${style.ring} ${pad} font-medium`}
      title={card}
    >
      <CreditCard className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      <span className="font-semibold tracking-wide">{style.label}</span>
      {last4 && (
        <span className="font-mono tabular-nums opacity-80">•{last4.slice(-2)}</span>
      )}
    </span>
  );
}
