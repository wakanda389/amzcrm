import { X, Clock, Flame } from 'lucide-react';
import type { Account } from '../types';
import { getWarnings, primeExpiryISO, lunaExpiryISO } from '../lib/workflow';
import { formatDate } from '../lib/date';

interface Props {
  accounts: Account[];
  onDismiss?: () => void;
}

export default function WarningsBanner({ accounts, onDismiss }: Props) {
  const items = accounts
    .map((a) => ({ account: a, warnings: getWarnings(a) }))
    .filter((x) => x.warnings.length > 0);

  if (items.length === 0) return null;

  const yellowCount = items.filter((x) =>
    x.warnings.some((w) => w.severity === 'yellow')
  ).length;
  const redCount = items.filter((x) =>
    x.warnings.some((w) => w.severity === 'red')
  ).length;

  return (
    <div className="space-y-3">
      {items.map(({ account, warnings }) => {
        const red = warnings.find((w) => w.severity === 'red');
        const yellow = warnings.find((w) => w.severity === 'yellow');
        const isRed = !!red;
        const w = red ?? yellow!;
        const Icon = isRed ? Flame : Clock;
        const container = isRed
          ? 'border-red-200 bg-red-50/70'
          : 'border-amber-200 bg-amber-50/70';
        const iconBg = isRed
          ? 'bg-red-100 text-red-600'
          : 'bg-amber-100 text-amber-600';
        const title = isRed ? 'Cảnh báo nghiêm trọng' : 'Cảnh báo cần xử lý';
        const titleColor = isRed ? 'text-red-900' : 'text-amber-900';
        const subColor = isRed ? 'text-red-700/80' : 'text-amber-700/80';
        const chip = isRed
          ? 'bg-red-100 text-red-700'
          : 'bg-amber-100 text-amber-700';
        const divider = isRed ? 'divide-red-100' : 'divide-amber-100';

        return (
          <div key={account.id} className={`rounded-2xl border shadow-sm ${container}`}>
            <div className="flex items-start gap-3 p-4 sm:p-5">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className={`text-sm font-semibold ${titleColor}`}>
                    {title}: {account.profileName}
                  </h3>
                  {onDismiss && (
                    <button
                      onClick={onDismiss}
                      className={`rounded-md p-1 transition-colors hover:bg-black/5 ${isRed ? 'text-red-400 hover:text-red-700' : 'text-amber-400 hover:text-amber-700'}`}
                      aria-label="Đóng cảnh báo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className={`mt-0.5 text-xs ${subColor}`}>{w.message}</p>
                <ul className={`mt-3 divide-y ${divider}`}>
                  {warnings.map((warn, i) => {
                    const expISO =
                      warn.kind === 'luna_expired'
                        ? lunaExpiryISO(account)
                        : primeExpiryISO(account);
                    const daysLabel =
                      warn.daysLeft === 0
                        ? 'hôm nay'
                        : warn.daysLeft < 0
                        ? `đã trễ ${Math.abs(warn.daysLeft)} ngày`
                        : `còn ${warn.daysLeft} ngày`;
                    return (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${warn.severity === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {warn.severity === 'red' ? 'Luna hết hạn' : 'Prime sắp hết'}
                          </span>
                          <span className="text-sm font-medium text-slate-800">
                            {warn.message}
                          </span>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2 text-xs text-slate-500">
                          {expISO && <span>Hạn: {formatDate(expISO)}</span>}
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${chip}`}>
                            {daysLabel}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
      {(yellowCount > 0 || redCount > 0) && (
        <p className="px-1 text-xs text-slate-400">
          Tổng cộng {yellowCount + redCount} tài khoản cần chú ý · {redCount > 0 && `${redCount} nghiêm trọng, `}
          {yellowCount > 0 && `${yellowCount} cần xử lý sớm`}
        </p>
      )}
    </div>
  );
}
