import { Pencil, Trash2, SearchX, ArrowRight, AlertOctagon, Clock, ChevronRight } from 'lucide-react';
import type { Account } from '../types';
import { WORKFLOW_STATUS_LABELS, nextWorkflowStatus } from '../types';
import { formatDate } from '../lib/date';
import { primeExpiryISO, lunaExpiryISO, getWarnings } from '../lib/workflow';
import PasswordCell from './PasswordCell';
import StatusBadge from './StatusBadge';
import CardBadge from './CardBadge';
import AddressCell from './AddressCell';

interface Props {
  accounts: Account[];
  selectedId?: string | null;
  onSelect: (account: Account) => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onAdvance: (account: Account) => void;
}

export default function AccountsTable({ accounts, selectedId, onSelect, onEdit, onDelete, onAdvance }: Props) {
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <SearchX className="h-7 w-7" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-700">Không tìm thấy tài khoản nào</p>
        <p className="mt-1 text-xs text-slate-500">
          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm, hoặc thêm tài khoản mới.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Desktop table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">STT</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Tên Profile</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Chủ tài khoản</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Mật khẩu Email</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Mật khẩu Amazon</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Số điện thoại</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Địa chỉ</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Thẻ đang dùng</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Hạn Prime</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Hạn Luna</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((a) => {
                const primeExp = primeExpiryISO(a);
                const lunaExp = lunaExpiryISO(a);
                const warnings = getWarnings(a);
                const hasYellow = warnings.some((w) => w.severity === 'yellow');
                const hasRed = warnings.some((w) => w.severity === 'red');
                const rowAccent = hasRed
                  ? 'bg-red-50/40'
                  : hasYellow
                  ? 'bg-amber-50/40'
                  : '';
                const selected = selectedId === a.id;
                const next = nextWorkflowStatus(a.workflowStatus);
                const canAdvance = next !== a.workflowStatus;
                return (
                  <tr
                    key={a.id}
                    onClick={() => onSelect(a)}
                    className={`group cursor-pointer transition-colors hover:bg-orange-50/40 ${rowAccent} ${
                      selected ? 'ring-2 ring-inset ring-orange-400 bg-orange-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-400 tabular-nums">
                      {a.stt}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                          {a.profileName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-semibold text-slate-900">
                            {a.profileName}
                          </span>
                          {warnings.length > 0 && (
                            <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-red-600">
                              <AlertOctagon className="h-3 w-3" />
                              {warnings[0].message}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{a.holderName || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{a.email}</td>
                    <td className="px-4 py-3">
                      <PasswordCell value={a.emailPassword} label="mật khẩu email" />
                    </td>
                    <td className="px-4 py-3">
                      <PasswordCell value={a.amazonPassword} label="mật khẩu Amazon" />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 tabular-nums">{a.phone}</td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <AddressCell address={a.address} />
                    </td>
                    <td className="px-4 py-3">
                      <CardBadge card={a.cardInUse} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.workflowStatus} />
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums">
                      {primeExp ? (
                        <ExpiryCell iso={primeExp} warn={hasYellow && a.workflowStatus === 'prime_running'} />
                      ) : (
                        <span className="text-slate-300">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums">
                      {lunaExp ? (
                        <ExpiryCell iso={lunaExp} warn={hasRed} red />
                      ) : (
                        <span className="text-slate-300">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {canAdvance && (
                          <button
                            onClick={() => onAdvance(a)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-slate-700 active:scale-[0.98]"
                            title={`Chuyển sang: ${WORKFLOW_STATUS_LABELS[next]}`}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">Next</span>
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(a)}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-900 hover:text-white"
                          aria-label="Sửa"
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(a)}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500 hover:text-white"
                          aria-label="Xóa"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden">
        <ul className="divide-y divide-slate-100">
          {accounts.map((a) => {
            const primeExp = primeExpiryISO(a);
            const lunaExp = lunaExpiryISO(a);
            const warnings = getWarnings(a);
            const hasYellow = warnings.some((w) => w.severity === 'yellow');
            const hasRed = warnings.some((w) => w.severity === 'red');
            const next = nextWorkflowStatus(a.workflowStatus);
            const canAdvance = next !== a.workflowStatus;
            const selected = selectedId === a.id;
            return (
              <li
                key={a.id}
                onClick={() => onSelect(a)}
                className={`cursor-pointer p-4 transition-colors hover:bg-orange-50/40 ${
                  hasRed ? 'bg-red-50/40' : hasYellow ? 'bg-amber-50/40' : ''
                } ${selected ? 'ring-2 ring-inset ring-orange-400 bg-orange-50/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                      {a.profileName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        <span className="mr-1.5 text-slate-400">#{a.stt}</span>
                        {a.profileName}
                      </p>
                      <p className="truncate text-xs text-slate-500">{a.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEdit(a)}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-900 hover:text-white"
                      aria-label="Sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(a)}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500 hover:text-white"
                      aria-label="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {warnings.length > 0 && (
                  <div className="mt-2.5 space-y-1">
                    {warnings.map((w, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
                          w.severity === 'red'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {w.severity === 'red' ? <AlertOctagon className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {w.message}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <StatusBadge status={a.workflowStatus} />
                  <CardBadge card={a.cardInUse} />
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div className="col-span-2">
                    <dt className="text-slate-400">Chủ tài khoản</dt>
                    <dd className="mt-0.5 text-slate-700">{a.holderName || <span className="text-slate-300">—</span>}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-400">Địa chỉ</dt>
                    <dd className="mt-0.5"><AddressCell address={a.address} maxChars={40} /></dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Mật khẩu Email</dt>
                    <dd className="mt-0.5"><PasswordCell value={a.emailPassword} label="mật khẩu email" /></dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Mật khẩu Amazon</dt>
                    <dd className="mt-0.5"><PasswordCell value={a.amazonPassword} label="mật khẩu Amazon" /></dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Hạn Prime</dt>
                    <dd className="mt-0.5">
                      {primeExp ? <ExpiryCell iso={primeExp} warn={hasYellow && a.workflowStatus === 'prime_running'} /> : <span className="text-slate-300">N/A</span>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Hạn Luna</dt>
                    <dd className="mt-0.5">
                      {lunaExp ? <ExpiryCell iso={lunaExp} warn={hasRed} red /> : <span className="text-slate-300">N/A</span>}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex items-center gap-2">
                  {canAdvance && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAdvance(a); }}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-700 active:scale-[0.98]"
                    >
                      <ArrowRight className="h-4 w-4" />
                      {WORKFLOW_STATUS_LABELS[next]}
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(a); }}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Chi tiết
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ExpiryCell({ iso, warn, red }: { iso: string; warn?: boolean; red?: boolean }) {
  if (red) {
    return (
      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 tabular-nums">
        {formatDate(iso)}
      </span>
    );
  }
  if (warn) {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 tabular-nums">
        {formatDate(iso)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 tabular-nums">
      {formatDate(iso)}
    </span>
  );
}
