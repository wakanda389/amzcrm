import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Account, Stage, STAGE_LABELS, STAGE_ORDER } from '../types';

interface Props {
  account: Account | null;
  onClose: () => void;
  onSave: (data: Partial<Account>) => void;
  onDelete?: (id: string) => void;
}

export default function AccountModal({ account, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState({
    profile_name: '',
    email: '',
    password: '',
    owner_name: '',
    phone: '',
    card_type: 'Visa',
    card_last4: '',
    address: '',
    notes: '',
    stage: 'prime_trial_running' as Stage,
    stage_start_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (account) {
      setForm({
        profile_name: account.profile_name,
        email: account.email,
        password: account.password,
        owner_name: account.owner_name || '',
        phone: account.phone || '',
        card_type: account.card_type || 'Visa',
        card_last4: account.card_last4 || '',
        address: account.address || '',
        notes: account.notes || '',
        stage: account.stage as Stage,
        stage_start_date: account.stage_start_date,
      });
    }
  }, [account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            {account ? 'Chỉnh sửa Tài khoản' : 'Thêm Tài khoản mới'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tên Profile</label>
              <input
                required
                className="input-field"
                value={form.profile_name}
                onChange={e => setForm({ ...form, profile_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <input
                required
                type="email"
                className="input-field"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Mật khẩu</label>
              <input
                required
                type="text"
                className="input-field"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tên chủ tài khoản</label>
              <input
                className="input-field"
                value={form.owner_name}
                onChange={e => setForm({ ...form, owner_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Số điện thoại</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Loại thẻ</label>
                <select
                  className="input-field"
                  value={form.card_type}
                  onChange={e => setForm({ ...form, card_type: e.target.value })}
                >
                  <option>Visa</option>
                  <option>Mastercard</option>
                  <option>Amex</option>
                  <option>JCB</option>
                  <option>Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">4 số cuối</label>
                <input
                  className="input-field"
                  maxLength={4}
                  value={form.card_last4}
                  onChange={e => setForm({ ...form, card_last4: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Giai đoạn</label>
              <select
                className="input-field"
                value={form.stage}
                onChange={e => setForm({ ...form, stage: e.target.value as Stage })}
              >
                {STAGE_ORDER.map(s => (
                  <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Ngày bắt đầu giai đoạn</label>
              <input
                type="date"
                required
                className="input-field"
                value={form.stage_start_date}
                onChange={e => setForm({ ...form, stage_start_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Địa chỉ</label>
            <input
              className="input-field"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Ghi chú</label>
            <textarea
              rows={3}
              className="input-field"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <div>
              {account && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa tài khoản này?')) {
                      onDelete(account.id);
                    }
                  }}
                  className="text-sm text-red-400 hover:text-red-300 font-medium"
                >
                  Xóa tài khoản
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary">
                Hủy
              </button>
              <button type="submit" className="btn-primary">
                {account ? 'Lưu thay đổi' : 'Thêm tài khoản'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
