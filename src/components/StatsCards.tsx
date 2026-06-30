import { Users, Crown, AlertTriangle, ClipboardList } from 'lucide-react';
import type { Account } from '../types';
import { getWarnings, getDailyTasks, totalDailyTasks } from '../lib/workflow';

interface Props {
  accounts: Account[];
}

export default function StatsCards({ accounts }: Props) {
  const total = accounts.length;
  const primeRunning = accounts.filter((a) => a.workflowStatus === 'prime_running').length;
  const warningCount = accounts.filter((a) => getWarnings(a).length > 0).length;
  const dailyCount = totalDailyTasks(getDailyTasks(accounts));

  const stats = [
    {
      label: 'Tổng số tài khoản',
      value: total,
      icon: Users,
      iconBg: 'bg-slate-100 text-slate-900',
      ring: 'ring-slate-200',
      sub: 'Toàn bộ profile đang quản lý',
      alert: false,
    },
    {
      label: 'Prime đang chạy',
      value: primeRunning,
      icon: Crown,
      iconBg: 'bg-orange-50 text-orange-600',
      ring: 'ring-orange-200',
      sub: 'Đang trong giai đoạn Prime Trial',
      alert: false,
    },
    {
      label: 'Cảnh báo cần xử lý',
      value: warningCount,
      icon: AlertTriangle,
      iconBg: warningCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500',
      ring: warningCount > 0 ? 'ring-red-200' : 'ring-slate-200',
      sub: 'Cần hủy Prime / Hết hạn Luna',
      alert: warningCount > 0,
    },
    {
      label: 'Đầu việc hôm nay',
      value: dailyCount,
      icon: ClipboardList,
      iconBg: dailyCount > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500',
      ring: dailyCount > 0 ? 'ring-blue-200' : 'ring-slate-200',
      sub: 'Hành động cần làm ngay',
      alert: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md ${s.ring} ring-1`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.iconBg}`}>
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
            </div>
            {s.alert && (
              <span className="absolute right-3 top-3 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
