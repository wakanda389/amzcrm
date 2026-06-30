import { useMemo } from 'react';
import { CreditCard, PieChart } from 'lucide-react';
import type { Account } from '../types';
import { detectCardBrand } from '../lib/card';

interface Props {
  accounts: Account[];
  selectedCard: string | null;
  onSelectCard: (card: string | null) => void;
}

const PALETTE = [
  '#f97316', // orange-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#64748b', // slate-500
];

interface CardStat {
  card: string;
  brand: string;
  last4: string;
  count: number;
  color: string;
}

export default function CardUsageChart({ accounts, selectedCard, onSelectCard }: Props) {
  const stats = useMemo<CardStat[]>(() => {
    const map = new Map<string, CardStat>();
    for (const a of accounts) {
      const card = (a.cardInUse || '').trim();
      if (!card) continue;
      const { brand, last4 } = detectCardBrand(card);
      const key = card;
      if (!map.has(key)) {
        map.set(key, { card, brand, last4, count: 0, color: '' });
      }
      map.get(key)!.count += 1;
    }
    const arr = Array.from(map.values()).sort((a, b) => b.count - a.count);
    arr.forEach((s, i) => {
      s.color = PALETTE[i % PALETTE.length];
    });
    return arr;
  }, [accounts]);

  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const noCard = accounts.filter((a) => !(a.cardInUse || '').trim()).length;

  // Donut geometry
  const size = 160;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = stats.map((s) => {
    const fraction = total > 0 ? s.count / total : 0;
    const dash = fraction * circumference;
    const seg = {
      color: s.color,
      dash,
      gap: circumference - dash,
      offset: -offset,
    };
    offset += dash;
    return seg;
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <PieChart className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tỷ lệ sử dụng thẻ</h3>
            <p className="text-xs text-slate-500">Phân bố thẻ theo tài khoản</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 tabular-nums">
          {total} thẻ
        </span>
      </div>

      {total === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <CreditCard className="h-6 w-6" />
          </div>
          <p className="mt-3 text-xs text-slate-400">Chưa có thẻ nào được ghi nhận</p>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          {/* Donut */}
          <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={stroke}
              />
              {segments.map((seg, i) => (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${seg.dash} ${seg.gap}`}
                  strokeDashoffset={seg.offset}
                  strokeLinecap="butt"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums text-slate-900">{total}</span>
              <span className="text-xs text-slate-400">tài khoản</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-1.5 self-stretch">
            {stats.map((s) => {
              const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
              const active = selectedCard === s.card;
              return (
                <button
                  key={s.card}
                  onClick={() => onSelectCard(active ? null : s.card)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-all ${
                    active ? 'bg-slate-100 ring-1 ring-slate-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="flex-1 truncate text-sm font-medium text-slate-700">
                    {s.card}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-slate-500">
                    {s.count}
                  </span>
                  <span className="w-9 text-right text-xs tabular-nums text-slate-400">
                    {pct}%
                  </span>
                </button>
              );
            })}
            {noCard > 0 && (
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 text-sm text-slate-400">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-slate-200" />
                <span className="flex-1">Chưa gán thẻ</span>
                <span className="text-xs font-semibold tabular-nums">{noCard}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedCard && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700 ring-1 ring-orange-200">
          <span>Đang lọc theo thẻ: <span className="font-semibold">{selectedCard}</span></span>
          <button
            onClick={() => onSelectCard(null)}
            className="font-semibold underline-offset-2 hover:underline"
          >
            Bỏ lọc
          </button>
        </div>
      )}
    </div>
  );
}
