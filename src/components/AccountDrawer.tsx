import { useEffect, useState } from 'react';
import {
  X, Pencil, Trash2, ArrowRight, MapPin, Mail, Phone, User, Calendar,
  Crown, Rocket, CreditCard, AlertOctagon, Clock, StickyNote, ShieldCheck,
} from 'lucide-react';
import type { Account } from '../types';
import { WORKFLOW_STATUS_LABELS, nextWorkflowStatus } from '../types';
import { formatDate } from '../lib/date';
import {
  primeExpiryISO, lunaExpiryISO, getWarnings, STATUS_META, PRIME_TRIAL_DAYS, LUNA_TRIAL_DAYS,
} from '../lib/workflow';
import StatusBadge from './StatusBadge';
import CardBadge from './CardBadge';

interface Props {
  account: Account | null;
  onClose: () => void;
  onEdit: (a: Account) => void;
  onDelete: (a: Account) => void;
  onAdvance: (a: Account) => void;
}

export default function AccountDrawer({ account, onClose, onEdit, onDelete, onAdvance }: Props) {
  const [showEmailPwd, setShowEmailPwd] = useState(false);
  const [showAmazonPwd, setShowAmazonPwd] = useState(false);

  useEffect(() => {
    setShowEmailPwd(false);
    setShowAmazonPwd(false);
  }, [account?.id]);

  useEffect(() => {
    if (!account) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [account, onClose]);

  if (!account) return null;

  const primeExp = primeExpiryISO(account);
  const lunaExp = lunaExpiryISO(account);
  const warnings = getWarnings(account);
  const next = nextWorkflowStatus(account.workflowStatus);
  const canAdvance = next !== account.workflowStatus;
  const meta = STATUS_META[account.workflowStatus];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl sm:max-w-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 px-5 py-4 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg font-bold backdrop-blur">
              {account.profileName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-300">#{account.stt} · Tài khoản</p>
              <h2 className="truncate text-lg font-bold">{account.profileName}</h2>
              <p className="truncate text-xs text-slate-300">{account.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-4">
            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="space-y-2">
                {warnings.map((w, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      w.severity === 'red'
                        ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                    }`}
                  >
                    {w.severity === 'red' ? <AlertOctagon className="h-4 w-4 flex-shrink-0 mt-0.5" /> : <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />}
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Status + advance */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Trạng thái vận hành</p>
                  <div className="mt-1.5">
                    <StatusBadge status={account.workflowStatus} size="md" />
                  </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.badgeClass}`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              {canAdvance && (
                <button
                  onClick={() => onAdvance(account)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700 active:scale-[0.98]"
                >
                  <ArrowRight className="h-4 w-4" />
                  Chuyển sang: {WORKFLOW_STATUS_LABELS[next]}
                </button>
              )}
              {!canAdvance && (
                <p className="mt-3 text-center text-xs text-slate-400">
                  Đã ở trạng thái cuối cùng của quy trình
                </p>
              )}
            </div>

            {/* Section: Thông tin cá nhân */}
            <Section title="Thông tin cá nhân" icon={User}>
              <DetailRow icon={User} label="Tên chủ tài khoản" value={account.holderName} />
              <DetailRow icon={Mail} label="Email" value={account.email} />
              <DetailRow icon={Phone} label="Số điện thoại" value={account.phone} mono />
              <DetailRow icon={Calendar} label="Ngày đăng ký" value={formatDate(account.registeredDate)} mono />
              <DetailRow icon={MapPin} label="Địa chỉ" value={account.address || '—'} multiline />
            </Section>

            {/* Section: Thông tin thanh toán */}
            <Section title="Thông tin thanh toán" icon={CreditCard}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CreditCard className="h-4 w-4" />
                  <span>Thẻ đang sử dụng</span>
                </div>
                <CardBadge card={account.cardInUse} size="md" />
              </div>
              <div className="mt-3 space-y-2.5">
                <PasswordRow
                  label="Mật khẩu Email"
                  value={account.emailPassword}
                  visible={showEmailPwd}
                  onToggle={() => setShowEmailPwd((v) => !v)}
                />
                <PasswordRow
                  label="Mật khẩu Amazon"
                  value={account.amazonPassword}
                  visible={showAmazonPwd}
                  onToggle={() => setShowAmazonPwd((v) => !v)}
                />
              </div>
            </Section>

            {/* Section: Trạng thái vận hành (timeline) */}
            <Section title="Quy trình Prime / Luna" icon={Crown}>
              <TimelineRow
                icon={Crown}
                iconBg="bg-orange-100 text-orange-600"
                label="Ngày kích Prime Trial"
                value={account.primeTrialDate ? formatDate(account.primeTrialDate) : '—'}
                expiry={primeExp ? formatDate(primeExp) : null}
                expiryLabel={`Hạn Prime (+${PRIME_TRIAL_DAYS} ngày)`}
                warn={warnings.some((w) => w.kind === 'prime_cancel_soon')}
              />
              <TimelineRow
                icon={Rocket}
                iconBg="bg-violet-100 text-violet-600"
                label="Ngày kích Luna Trial"
                value={account.lunaTrialDate ? formatDate(account.lunaTrialDate) : '—'}
                expiry={lunaExp ? formatDate(lunaExp) : null}
                expiryLabel={`Hạn Luna (+${LUNA_TRIAL_DAYS} ngày)`}
                warn={warnings.some((w) => w.kind === 'luna_expired')}
                red
              />
            </Section>

            {/* Notes */}
            {account.notes && (
              <Section title="Ghi chú" icon={StickyNote}>
                <p className="whitespace-pre-wrap text-sm text-slate-600">{account.notes}</p>
              </Section>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3">
          <button
            onClick={() => onDelete(account)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
          <button
            onClick={() => onEdit(account)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            <Pencil className="h-4 w-4" />
            Chỉnh sửa tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
        <Icon className="h-4 w-4 text-slate-700" />
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <div className="mt-3 space-y-2.5">{children}</div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
  multiline,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p
          className={`mt-0.5 text-sm text-slate-800 ${mono ? 'tabular-nums' : ''} ${
            multiline ? 'whitespace-pre-wrap' : 'truncate'
          }`}
          title={multiline ? undefined : value}
        >
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function PasswordRow({
  label,
  value,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`font-mono text-sm tabular-nums ${visible ? 'text-slate-900' : 'text-slate-400'}`}>
          {visible ? value : '••••••••'}
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  );
}

function TimelineRow({
  icon: Icon,
  iconBg,
  label,
  value,
  expiry,
  expiryLabel,
  warn,
  red,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  label: string;
  value: string;
  expiry: string | null;
  expiryLabel: string;
  warn?: boolean;
  red?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800 tabular-nums">{value}</p>
        {expiry && (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-xs text-slate-400">{expiryLabel}:</span>
            <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                red
                  ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                  : warn
                  ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                  : 'bg-slate-50 text-slate-600'
              }`}
            >
              {expiry}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Eye() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
