import { useState } from 'react';
import {
  Copy, ChevronRight, ChevronDown, ArrowRight, Edit2, Trash2,
} from 'lucide-react';
import { Account, Stage, STAGE_LABELS, STAGE_COLORS, STAGE_ORDER } from '../types';
import PasswordField from './PasswordField';

interface Props {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  onStageAdvance: (account: Account) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export default function AccountTable({ accounts, onEdit, onDelete, onStageAdvance, onShowToast }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const today = new Date();

  const toggleExpand = (id: string) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`Đã sao chép ${label}`, 'success');
  };

  const getDaysRemaining = (account: Account) => {
    const start = new Date(account.stage_start_date);
    const days = Math.floor((today.getTime() - start.getTime()) / 86400000);
    if (account.stage === 'prime_trial_running') return 30 - days;
    if (account.stage === 'prime_trial_cancelled') return 30 - days;
    if (account.stage === 'luna_trial_running') return 7 - days;
    return null;
  };

  const getAlert = (account: Account) => {
    const remaining = getDaysRemaining(account);
    if (account.stage === 'prime_trial_running' && remaining !== null && remaining <= 3) {
      return { text: `Cần hủy gói! Còn ${remaining} ngày`, color: 'text-amber-400 font-bold', flash: false };
    }
    if (account.stage === 'luna_trial_running' && remaining !== null && remaining <= 0) {
      return { text: 'Hết hạn Luna! Lên Prime Trả Phí ngay', color: 'text-red-400 font-bold', flash: true };
    }
    if (account.stage === 'luna_needed') {
      return { text: 'Cần kích Luna Trial ngay!', color: 'text-red-400 font-bold', flash: false };
    }
    return null;
  };

  const getCardBadge = (type: string | null, last4: string | null) => {
    if (!type || !last4) return <span className="text-slate-500 text-xs">Chưa có thẻ</span>;
    const t = type.toLowerCase();
    const color =
      t.includes('visa') ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
      t.includes('master') ? 'bg-red-500/20 text-red-300 border-red-500/30' :
      t.includes('amex') ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
      t.includes('jcb') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
      'bg-slate-500/20 text-slate-300 border-slate-500/30';
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
        {type.substring(0, 6)}...{last4}
      </span>
    );
  };

  const nextStage = (current: Stage): Stage | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx >= 0 && idx < STAGE_ORDER.length - 1) return STAGE_ORDER[idx + 1];
    return null;
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-700">
              <th className="table-header w-10"></th>
              <th className="table-header text-left">STT</th>
              <th className="table-header text-left">Tên Profile</th>
              <th className="table-header text-left">Email</th>
              <th className="table-header text-left">Mật khẩu</th>
              <th className="table-header text-left">Thông tin cá nhân</th>
              <th className="table-header text-left">Thẻ đang dùng</th>
              <th className="table-header text-left">Giai đoạn</th>
              <th className="table-header text-left">Cảnh báo</th>
              <th className="table-header text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {accounts.map((account, index) => {
              const alert = getAlert(account);
              const ns = nextStage(account.stage);
              const isExpanded = expandedRows.has(account.id);
              return (
                <>
                  <tr
                    key={account.id}
                    className={`hover:bg-slate-800/50 transition-colors ${alert?.flash ? 'animate-flash-red' : ''}`}
                  >
                    <td className="table-cell w-10">
                      <button
                        onClick={() => toggleExpand(account.id)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="table-cell font-medium text-slate-400">{index + 1}</td>
                    <td className="table-cell font-semibold text-white">{account.profile_name}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 text-sm">{account.email}</span>
                        <button
                          onClick={() => copyToClipboard(account.email, 'email')}
                          className="text-slate-500 hover:text-amber-400 transition-colors"
                          title="Sao chép email"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="table-cell">
                      <PasswordField password={account.password} />
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        <p className="text-slate-300">{account.owner_name || <span className="text-slate-500">—</span>}</p>
                        {account.phone && <p className="text-slate-400 text-xs mt-0.5">{account.phone}</p>}
                      </div>
                    </td>
                    <td className="table-cell">
                      {getCardBadge(account.card_type, account.card_last4)}
                    </td>
                    <td className="table-cell">
                      <span className={`badge-stage ${STAGE_COLORS[account.stage]}`}>
                        {STAGE_LABELS[account.stage]}
                      </span>
                    </td>
                    <td className="table-cell">
                      {alert ? (
                        <span className={`text-xs ${alert.color}`}>{alert.text}</span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {ns && (
                          <button
                            onClick={() => onStageAdvance(account)}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-all"
                            title={`Chuyển sang: ${STAGE_LABELS[ns]}`}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(account)}
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn xóa?')) onDelete(account.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={10} className="px-4 py-3 bg-slate-900/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-slate-500 text-xs">Địa chỉ:</span>
                            <p className="text-slate-300 mt-0.5">{account.address || <span className="text-slate-600">Chưa có địa chỉ</span>}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs">Ghi chú:</span>
                            <p className="text-slate-300 mt-0.5">{account.notes || <span className="text-slate-600">Không có ghi chú</span>}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs">Ngày bắt đầu giai đoạn:</span>
                            <p className="text-slate-300 mt-0.5">{account.stage_start_date}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs">Ngày tạo:</span>
                            <p className="text-slate-300 mt-0.5">{new Date(account.created_at).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      {accounts.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p className="text-sm">Chưa có tài khoản nào. Nhấn "Thêm tài khoản" để bắt đầu.</p>
        </div>
      )}
    </div>
  );
}
