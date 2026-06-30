import type { Account, WorkflowStatus } from '../types';
import { addDaysISO, daysUntil } from './date';

export const PRIME_TRIAL_DAYS = 30;
export const LUNA_TRIAL_DAYS = 7;
export const PRIME_WARNING_WINDOW = 3; // days before expiry to flag yellow

export function primeExpiryISO(account: Account): string | null {
  if (!account.primeTrialDate) return null;
  return addDaysISO(account.primeTrialDate, PRIME_TRIAL_DAYS);
}

export function lunaExpiryISO(account: Account): string | null {
  if (!account.lunaTrialDate) return null;
  return addDaysISO(account.lunaTrialDate, LUNA_TRIAL_DAYS);
}

export type WarningKind = 'prime_cancel_soon' | 'luna_expired';

export interface Warning {
  kind: WarningKind;
  message: string;
  severity: 'yellow' | 'red';
  expiryISO: string;
  daysLeft: number;
}

export function getWarnings(account: Account): Warning[] {
  const warnings: Warning[] = [];

  // Prime Trial: within 3 days of expiry AND status still "Prime Trial - Đang chạy"
  if (account.workflowStatus === 'prime_running' && account.primeTrialDate) {
    const exp = primeExpiryISO(account)!;
    const d = daysUntil(exp);
    if (d >= 0 && d <= PRIME_WARNING_WINDOW) {
      warnings.push({
        kind: 'prime_cancel_soon',
        message: 'Cần hủy gói Prime Trial!',
        severity: 'yellow',
        expiryISO: exp,
        daysLeft: d,
      });
    }
  }

  // Luna Trial: reached expiry (daysLeft <= 0) AND status is "Luna Trial - Đang chạy"
  if (account.workflowStatus === 'luna_running' && account.lunaTrialDate) {
    const exp = lunaExpiryISO(account)!;
    const d = daysUntil(exp);
    if (d <= 0) {
      warnings.push({
        kind: 'luna_expired',
        message: 'Hết hạn Luna! Cần lên Prime Trả Phí',
        severity: 'red',
        expiryISO: exp,
        daysLeft: d,
      });
    }
  }

  return warnings;
}

export function hasWarnings(account: Account): boolean {
  return getWarnings(account).length > 0;
}

// ---- Daily Tasks (Đầu việc hôm nay) ----

export interface DailyTask {
  account: Account;
  reason: string;
  detail: string;
  expiryISO?: string;
  daysLeft?: number;
}

export interface DailyTasks {
  cancelPrime: DailyTask[]; // List 1
  startLuna: DailyTask[]; // List 2
  startPaidPrime: DailyTask[]; // List 3
}

export function getDailyTasks(accounts: Account[]): DailyTasks {
  const result: DailyTasks = { cancelPrime: [], startLuna: [], startPaidPrime: [] };

  for (const a of accounts) {
    // List 1: Accounts needing Prime cancellation (sắp hết hạn 30 ngày)
    // Status "Prime Trial - Đang chạy" and within 3 days of expiry (matches yellow warning)
    if (a.workflowStatus === 'prime_running' && a.primeTrialDate) {
      const exp = primeExpiryISO(a)!;
      const d = daysUntil(exp);
      if (d >= 0 && d <= PRIME_WARNING_WINDOW) {
        result.cancelPrime.push({
          account: a,
          reason: 'Sắp hết hạn Prime Trial',
          detail: `Cần hủy gói Prime Trial trước ${formatDate(exp)} (còn ${d} ngày).`,
          expiryISO: exp,
          daysLeft: d,
        });
      }
    }

    // List 2: Accounts ready for Luna Trial (Prime Trial đã hết hạn hoàn toàn)
    // Either status is "need_luna" OR prime trial has fully expired
    if (a.workflowStatus === 'need_luna') {
      const exp = a.primeTrialDate ? primeExpiryISO(a) : null;
      const d = exp ? daysUntil(exp) : null;
      result.startLuna.push({
        account: a,
        reason: 'Cần kích Luna Trial',
        detail: exp
          ? `Prime Trial đã hết hạn ${formatDate(exp)}. Cần vào kích 7-day Luna Trial.`
          : 'Prime Trial đã kết thúc. Cần vào kích 7-day Luna Trial.',
        expiryISO: exp ?? undefined,
        daysLeft: d ?? undefined,
      });
    } else if (a.workflowStatus === 'prime_cancelled' && a.primeTrialDate) {
      const exp = primeExpiryISO(a)!;
      const d = daysUntil(exp);
      if (d < 0) {
        result.startLuna.push({
          account: a,
          reason: 'Cần kích Luna Trial',
          detail: `Prime Trial đã hết hạn ${formatDate(exp)}. Cần vào kích 7-day Luna Trial.`,
          expiryISO: exp,
          daysLeft: d,
        });
      }
    }

    // List 3: Accounts ready for Paid Prime (Luna Trial đã hết 7 ngày)
    // Status "luna_running" and luna trial has expired
    if (a.workflowStatus === 'luna_running' && a.lunaTrialDate) {
      const exp = lunaExpiryISO(a)!;
      const d = daysUntil(exp);
      if (d <= 0) {
        result.startPaidPrime.push({
          account: a,
          reason: 'Cần lên Prime Trả Phí',
          detail: `Luna Trial đã hết hạn ${formatDate(exp)}. Cần kích hoạt Prime Trả Phí.`,
          expiryISO: exp,
          daysLeft: d,
        });
      }
    }
  }

  return result;
}

export function totalDailyTasks(tasks: DailyTasks): number {
  return tasks.cancelPrime.length + tasks.startLuna.length + tasks.startPaidPrime.length;
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// ---- Status metadata for UI ----

export interface StatusMeta {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const STATUS_META: Record<WorkflowStatus, StatusMeta> = {
  prime_running: {
    label: 'Prime Trial - Đang chạy',
    badgeClass: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    dotClass: 'bg-orange-500',
  },
  prime_cancelled: {
    label: 'Prime Trial - Đã hủy (Chờ hết hạn)',
    badgeClass: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dotClass: 'bg-amber-500',
  },
  need_luna: {
    label: 'Cần kích Luna Trial',
    badgeClass: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    dotClass: 'bg-blue-500',
  },
  luna_running: {
    label: 'Luna Trial - Đang chạy',
    badgeClass: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    dotClass: 'bg-violet-500',
  },
  prime_paid: {
    label: 'Prime Trả Phí - Active',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dotClass: 'bg-emerald-500',
  },
};

export function shouldShowLunaDate(status: WorkflowStatus): boolean {
  return status === 'luna_running';
}
