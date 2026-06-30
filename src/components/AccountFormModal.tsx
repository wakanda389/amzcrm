import { useEffect, useState } from 'react';
import { X, Save, Crown, UserPlus, Pencil, AlertCircle, Workflow, User } from 'lucide-react';
import type { Account, AccountInput, WorkflowStatus } from '../types';
import { WORKFLOW_STATUS_LABELS, WORKFLOW_ORDER } from '../types';
import { addDaysISO, formatDate, todayISO } from '../lib/date';
import { STATUS_META, shouldShowLunaDate } from '../lib/workflow';

interface Props {
  open: boolean;
  initial: Account | null;
  onClose: () => void;
  onSubmit: (input: AccountInput) => void;
}

const empty: AccountInput = {
  profileName: '',
  email: '',
  emailPassword: '',
  amazonPassword: '',
  phone: '',
  registeredDate: todayISO(),
  workflowStatus: 'prime_running',
  primeTrialDate: null,
  lunaTrialDate: null,
  notes: '',
  holderName: '',
  address: '',
  cardInUse: '',
};

export default function AccountFormModal({ open, initial, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<AccountInput>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof AccountInput, string>>>({});
  const [showEmailPwd, setShowEmailPwd] = useState(false);
  const [showAmazonPwd, setShowAmazonPwd] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        profileName: initial.profileName,
        email: initial.email,
        emailPassword: initial.emailPassword,
        amazonPassword: initial.amazonPassword,
        phone: initial.phone,
        registeredDate: initial.registeredDate,
        workflowStatus: initial.workflowStatus,
        primeTrialDate: initial.primeTrialDate,
        lunaTrialDate: initial.lunaTrialDate,
        notes: initial.notes ?? '',
        holderName: initial.holderName ?? '',
        address: initial.address ?? '',
        cardInUse: initial.cardInUse ?? '',
      });
    } else {
      setForm({ ...empty, registeredDate: todayISO() });
    }
    setErrors({});
    setShowEmailPwd(false);
    setShowAmazonPwd(false);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const update = <K extends keyof AccountInput>(key: K, value: AccountInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof AccountInput, string>> = {};
    if (!form.profileName.trim()) e.profileName = 'Vui lòng nhập tên profile';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.emailPassword) e.emailPassword = 'Vui lòng nhập mật khẩu email';
    if (!form.amazonPassword) e.amazonPassword = 'Vui lòng nhập mật khẩu Amazon';
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại';
    if (!form.registeredDate) e.registeredDate = 'Vui lòng chọn ngày đăng ký';
    const needsPrime = ['prime_running', 'prime_cancelled', 'need_luna', 'luna_running', 'prime_paid'];
    if (needsPrime.includes(form.workflowStatus) && !form.primeTrialDate) {
      e.primeTrialDate = 'Vui lòng chọn ngày kích Prime Trial';
    }
    if (form.workflowStatus === 'luna_running' && !form.lunaTrialDate) {
      e.lunaTrialDate = 'Vui lòng chọn ngày kích Luna Trial';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload: AccountInput = {
      ...form,
      profileName: form.profileName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      lunaTrialDate: shouldShowLunaDate(form.workflowStatus) ? form.lunaTrialDate : null,
    };
    onSubmit(payload);
  };

  const primeExpiry = form.primeTrialDate ? addDaysISO(form.primeTrialDate, 30) : null;
  const lunaExpiry = form.lunaTrialDate ? addDaysISO(form.lunaTrialDate, 7) : null;
  const showLuna = shouldShowLunaDate(form.workflowStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              {initial ? <Pencil className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initial ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
              </h2>
              <p className="text-xs text-slate-500">
                Điền đầy đủ thông tin tài khoản Amazon
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto">
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tên Profile" required error={errors.profileName}>
                <input
                  type="text"
                  value={form.profileName}
                  onChange={(e) => update('profileName', e.target.value)}
                  placeholder="VD: Amazon US - Minh Nguyễn"
                  className={inputClass(!!errors.profileName)}
                />
              </Field>
              <Field label="Email" required error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="email@example.com"
                  className={inputClass(!!errors.email)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Mật khẩu Email" required error={errors.emailPassword}>
                <PasswordInput
                  value={form.emailPassword}
                  visible={showEmailPwd}
                  onToggle={() => setShowEmailPwd((v) => !v)}
                  onChange={(v) => update('emailPassword', v)}
                  placeholder="••••••••"
                  error={!!errors.emailPassword}
                />
              </Field>
              <Field label="Mật khẩu Amazon" required error={errors.amazonPassword}>
                <PasswordInput
                  value={form.amazonPassword}
                  visible={showAmazonPwd}
                  onToggle={() => setShowAmazonPwd((v) => !v)}
                  onChange={(v) => update('amazonPassword', v)}
                  placeholder="••••••••"
                  error={!!errors.amazonPassword}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Số điện thoại" required error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+1 (415) 555-0142"
                  className={inputClass(!!errors.phone)}
                />
              </Field>
              <Field label="Ngày đăng ký" required error={errors.registeredDate}>
                <input
                  type="date"
                  value={form.registeredDate}
                  onChange={(e) => update('registeredDate', e.target.value)}
                  className={inputClass(!!errors.registeredDate)}
                />
              </Field>
            </div>

            {/* Personal & payment info */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-700" />
                <h3 className="text-sm font-semibold text-slate-900">Thông tin cá nhân & thanh toán</h3>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Tên chủ tài khoản">
                  <input
                    type="text"
                    value={form.holderName}
                    onChange={(e) => update('holderName', e.target.value)}
                    placeholder="VD: Nguyễn Văn Minh"
                    className={inputClass(false)}
                  />
                </Field>
                <Field label="Thẻ đang sử dụng">
                  <input
                    type="text"
                    value={form.cardInUse}
                    onChange={(e) => update('cardInUse', e.target.value)}
                    placeholder="VD: Visa •••• 1234"
                    className={inputClass(false)}
                  />
                </Field>
              </div>

              <div className="mt-3">
                <Field label="Địa chỉ">
                  <textarea
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    rows={2}
                    placeholder="Địa chỉ đầy đủ (số nhà, đường, thành phố, quốc gia...)"
                    className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </Field>
              </div>
            </div>

            {/* Workflow section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-slate-700" />
                <h3 className="text-sm font-semibold text-slate-900">Quy trình Prime / Luna</h3>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Trạng thái quy trình" required>
                  <select
                    value={form.workflowStatus}
                    onChange={(e) => {
                      const status = e.target.value as WorkflowStatus;
                      update('workflowStatus', status);
                      if (!shouldShowLunaDate(status)) {
                        update('lunaTrialDate', null);
                      }
                    }}
                    className={inputClass(false)}
                  >
                    {WORKFLOW_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {WORKFLOW_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_META[form.workflowStatus].badgeClass}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[form.workflowStatus].dotClass}`} />
                      {STATUS_META[form.workflowStatus].label}
                    </span>
                  </div>
                </Field>

                <Field
                  label="Ngày kích Prime Trial"
                  required
                  error={errors.primeTrialDate}
                >
                  <input
                    type="date"
                    value={form.primeTrialDate ?? ''}
                    onChange={(e) => update('primeTrialDate', e.target.value || null)}
                    className={inputClass(!!errors.primeTrialDate)}
                  />
                </Field>
              </div>

              {primeExpiry && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700 ring-1 ring-orange-200">
                  <Crown className="h-3.5 w-3.5" />
                  <span>
                    Hạn Prime Trial (tự động +30 ngày):{' '}
                    <span className="font-semibold tabular-nums">{formatDate(primeExpiry)}</span>
                  </span>
                </div>
              )}

              {showLuna && (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Ngày kích Luna Trial"
                    required
                    error={errors.lunaTrialDate}
                  >
                    <input
                      type="date"
                      value={form.lunaTrialDate ?? ''}
                      onChange={(e) => update('lunaTrialDate', e.target.value || null)}
                      className={inputClass(!!errors.lunaTrialDate)}
                    />
                  </Field>
                  <div className="flex items-end">
                    {lunaExpiry && (
                      <div className="flex w-full items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700 ring-1 ring-violet-200">
                        <span>
                          Hạn Luna Trial (+7 ngày):{' '}
                          <span className="font-semibold tabular-nums">{formatDate(lunaExpiry)}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!showLuna && (
                <p className="mt-3 text-xs text-slate-400">
                  Trường "Ngày kích Luna Trial" chỉ hiển thị khi trạng thái là{' '}
                  <span className="font-medium">"Luna Trial - Đang chạy"</span>.
                </p>
              )}
            </div>

            <Field label="Ghi chú">
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={3}
                placeholder="Ghi chú thêm về tài khoản (tùy chọn)..."
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              {initial ? 'Lưu thay đổi' : 'Thêm tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return `w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'
  }`;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordInput({
  value,
  visible,
  onToggle,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass(!!error)} pr-10 font-mono`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {visible ? <Eye /> : <EyeOff />}
      </button>
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
