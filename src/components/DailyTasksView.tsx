import { Ban, Rocket, CreditCard, ArrowRight, CheckCircle2, CalendarClock } from 'lucide-react';
import type { Account } from '../types';
import { getDailyTasks, type DailyTask } from '../lib/workflow';
import { formatDate } from '../lib/date';
import StatusBadge from './StatusBadge';

interface Props {
  accounts: Account[];
  onAdvance: (account: Account) => void;
}

export default function DailyTasksView({ accounts, onAdvance }: Props) {
  const tasks = getDailyTasks(accounts);
  const total = tasks.cancelPrime.length + tasks.startLuna.length + tasks.startPaidPrime.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700">Không có đầu việc hôm nay</p>
        <p className="mt-1 text-xs text-slate-500">
          Tất cả tài khoản đều đang ở trạng thái phù hợp. Tuyệt vời!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Column
        title="Cần hủy Prime Trial"
        subtitle="Sắp hết hạn 30 ngày"
        icon={Ban}
        accent="amber"
        tasks={tasks.cancelPrime}
        onAdvance={onAdvance}
        advanceLabel="Đã hủy Prime"
      />
      <Column
        title="Cần kích Luna Trial"
        subtitle="Prime đã hết hạn, kích 7-day Luna"
        icon={Rocket}
        accent="blue"
        tasks={tasks.startLuna}
        onAdvance={onAdvance}
        advanceLabel="Đã kích Luna"
      />
      <Column
        title="Cần lên Prime Trả Phí"
        subtitle="Luna Trial đã hết 7 ngày"
        icon={CreditCard}
        accent="emerald"
        tasks={tasks.startPaidPrime}
        onAdvance={onAdvance}
        advanceLabel="Đã kích Prime Trả Phí"
      />
    </div>
  );
}

interface ColumnProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'amber' | 'blue' | 'emerald';
  tasks: DailyTask[];
  onAdvance: (account: Account) => void;
  advanceLabel: string;
}

function Column({ title, subtitle, icon: Icon, accent, tasks, onAdvance, advanceLabel }: ColumnProps) {
  const styles = {
    amber: {
      header: 'bg-amber-50 text-amber-900 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-600',
      count: 'bg-amber-100 text-amber-700',
      card: 'border-amber-200/60 hover:border-amber-300',
    },
    blue: {
      header: 'bg-blue-50 text-blue-900 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-600',
      count: 'bg-blue-100 text-blue-700',
      card: 'border-blue-200/60 hover:border-blue-300',
    },
    emerald: {
      header: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-600',
      count: 'bg-emerald-100 text-emerald-700',
      card: 'border-emerald-200/60 hover:border-emerald-300',
    },
  }[accent];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`flex items-center justify-between gap-2 border-b px-4 py-3 ${styles.header}`}>
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles.iconBg}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight">{title}</h3>
            <p className="text-xs opacity-80">{subtitle}</p>
          </div>
        </div>
        <span className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-sm font-bold tabular-nums ${styles.count}`}>
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 space-y-3 p-3">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center">
            <CheckCircle2 className="h-6 w-6 text-slate-300" />
            <p className="mt-2 text-xs text-slate-400">Không có tài khoản cần xử lý</p>
          </div>
        ) : (
          tasks.map((t) => (
            <div
              key={t.account.id}
              className={`rounded-xl border bg-white p-3.5 transition-all hover:shadow-sm ${styles.card}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                    {t.account.profileName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {t.account.profileName}
                    </p>
                    <p className="truncate text-xs text-slate-500">{t.account.email}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400 tabular-nums">#{t.account.stt}</span>
              </div>

              <div className="mt-2.5">
                <StatusBadge status={t.account.workflowStatus} />
              </div>

              <p className="mt-2.5 text-xs text-slate-600">{t.detail}</p>

              {t.expiryISO && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span className="tabular-nums">Hạn: {formatDate(t.expiryISO)}</span>
                  {t.daysLeft !== undefined && (
                    <span
                      className={`ml-1 rounded px-1.5 py-0.5 text-xs font-semibold ${
                        t.daysLeft <= 0
                          ? 'bg-red-100 text-red-700'
                          : t.daysLeft <= 3
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.daysLeft === 0 ? 'hôm nay' : t.daysLeft < 0 ? `trễ ${Math.abs(t.daysLeft)}d` : `còn ${t.daysLeft}d`}
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => onAdvance(t.account)}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-slate-700 active:scale-[0.98]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                {advanceLabel}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
