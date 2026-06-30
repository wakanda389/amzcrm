import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Plus, Upload, Download, Search, RefreshCw, Loader2,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { Account, Stage, STAGE_LABELS } from './types';
import { downloadSampleCSV, parseCSV } from './utils/csv';
import AnalyticsTopSection from './components/AnalyticsTopSection';
import AccountTable from './components/AccountTable';
import AccountModal from './components/AccountModal';
import Toast from './components/Toast';

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('amazon_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filteredAccounts = accounts.filter(a =>
    a.profile_name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.owner_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (a.phone?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const handleSave = async (data: Partial<Account>) => {
    if (editingAccount) {
      const { error } = await supabase
        .from('amazon_accounts')
        .update(data)
        .eq('id', editingAccount.id);
      if (error) {
        showToast('Lỗi cập nhật: ' + error.message, 'error');
      } else {
        showToast('Cập nhật thành công!', 'success');
        setModalOpen(false);
        setEditingAccount(null);
        fetchAccounts();
      }
    } else {
      const { error } = await supabase.from('amazon_accounts').insert(data);
      if (error) {
        showToast('Lỗi thêm tài khoản: ' + error.message, 'error');
      } else {
        showToast('Thêm tài khoản thành công!', 'success');
        setModalOpen(false);
        fetchAccounts();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('amazon_accounts').delete().eq('id', id);
    if (error) {
      showToast('Lỗi xóa: ' + error.message, 'error');
    } else {
      showToast('Đã xóa tài khoản!', 'success');
      fetchAccounts();
    }
  };

  const handleStageAdvance = async (account: Account) => {
    const stages: Stage[] = [
      'prime_trial_running',
      'prime_trial_cancelled',
      'luna_needed',
      'luna_trial_running',
      'prime_paid_active',
    ];
    const idx = stages.indexOf(account.stage);
    if (idx >= 0 && idx < stages.length - 1) {
      const next = stages[idx + 1];
      const { error } = await supabase
        .from('amazon_accounts')
        .update({ stage: next, stage_start_date: new Date().toISOString().split('T')[0] })
        .eq('id', account.id);
      if (error) {
        showToast('Lỗi chuyển giai đoạn: ' + error.message, 'error');
      } else {
        showToast(`Chuyển sang: ${STAGE_LABELS[next]}`, 'success');
        fetchAccounts();
      }
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseCSV(file);
      const valid = rows.filter(r => r.profile_name && r.email && r.password);
      if (valid.length === 0) {
        showToast('Không tìm thấy dữ liệu hợp lệ trong file!', 'error');
        setImporting(false);
        return;
      }
      const { error } = await supabase.from('amazon_accounts').insert(valid);
      if (error) {
        showToast('Lỗi nhập dữ liệu: ' + error.message, 'error');
      } else {
        showToast(`Đã nhập thành công ${valid.length} tài khoản!`, 'success');
        fetchAccounts();
      }
    } catch (err) {
      showToast('Lỗi đọc file CSV: ' + (err as Error).message, 'error');
    }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Amazon CRM</h1>
              <p className="text-xs text-slate-400">Quản lý tài khoản Amazon</p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="input-field pl-9 w-64"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={() => {
                setEditingAccount(null);
                setModalOpen(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Thêm tài khoản
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="btn-secondary"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Nhập từ File Excel/CSV
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />

            <button
              onClick={downloadSampleCSV}
              className="btn-secondary"
            >
              <Download className="w-4 h-4" />
              Tải File Mẫu
            </button>

            <button
              onClick={fetchAccounts}
              className="btn-secondary"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            <AnalyticsTopSection accounts={accounts} />
            <AccountTable
              accounts={filteredAccounts}
              onEdit={(a) => {
                setEditingAccount(a);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
              onStageAdvance={handleStageAdvance}
              onShowToast={showToast}
            />
          </>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <AccountModal
          account={editingAccount}
          onClose={() => {
            setModalOpen(false);
            setEditingAccount(null);
          }}
          onSave={handleSave}
          onDelete={editingAccount ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
