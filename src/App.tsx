import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import type { Account, AccountInput, FilterTab, WorkflowStatus } from './types';
import { nextWorkflowStatus } from './types';
import { loadAccounts, saveAccounts, genId } from './lib/storage';
import { seedAccounts } from './lib/seed';
import { accountsToCSV, downloadCSV } from './lib/csv';
import { todayISO } from './lib/date';
import { getDailyTasks, totalDailyTasks, getWarnings } from './lib/workflow';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import WarningsBanner from './components/WarningsBanner';
import Toolbar from './components/Toolbar';
import AccountsTable from './components/AccountsTable';
import AccountFormModal from './components/AccountFormModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import DailyTasksView from './components/DailyTasksView';
import AccountDrawer from './components/AccountDrawer';
import CardUsageChart from './components/CardUsageChart';

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [selected, setSelected] = useState<Account | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Load from localStorage on mount; seed if empty
  useEffect(() => {
    const stored = loadAccounts();
    if (stored.length === 0) {
      setAccounts(seedAccounts());
    } else {
      setAccounts(stored);
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (accounts.length === 0) return;
    saveAccounts(accounts);
  }, [accounts]);

  // Keep the selected drawer account in sync with accounts state (e.g. after advance/edit)
  useEffect(() => {
    if (!selected) return;
    const updated = accounts.find((a) => a.id === selected.id) ?? null;
    if (updated && updated !== selected) setSelected(updated);
    if (!updated) setSelected(null);
  }, [accounts, selected]);

  const dailyTasks = useMemo(() => getDailyTasks(accounts), [accounts]);
  const dailyCount = totalDailyTasks(dailyTasks);
  const warningAccounts = useMemo(
    () => accounts.filter((a) => getWarnings(a).length > 0),
    [accounts]
  );
  const showWarningsBanner = !alertDismissed && warningAccounts.length > 0;

  const counts = useMemo<Record<FilterTab, number>>(
    () => ({
      all: accounts.length,
      daily: dailyCount,
      prime_running: accounts.filter((a) => a.workflowStatus === 'prime_running').length,
      prime_cancelled: accounts.filter((a) => a.workflowStatus === 'prime_cancelled').length,
      need_luna: accounts.filter((a) => a.workflowStatus === 'need_luna').length,
      luna_running: accounts.filter((a) => a.workflowStatus === 'luna_running').length,
      prime_paid: accounts.filter((a) => a.workflowStatus === 'prime_paid').length,
    }),
    [accounts, dailyCount]
  );

  const dailyAccountIds = useMemo(() => {
    const ids = new Set<string>();
    dailyTasks.cancelPrime.forEach((t) => ids.add(t.account.id));
    dailyTasks.startLuna.forEach((t) => ids.add(t.account.id));
    dailyTasks.startPaidPrime.forEach((t) => ids.add(t.account.id));
    return ids;
  }, [dailyTasks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts
      .filter((a) => {
        if (filter === 'all') {
          // no status filter
        } else if (filter === 'daily') {
          if (!dailyAccountIds.has(a.id)) return false;
        } else {
          if (a.workflowStatus !== (filter as WorkflowStatus)) return false;
        }
        if (selectedCard && a.cardInUse !== selectedCard) return false;
        if (!q) return true;
        return (
          a.profileName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.holderName || '').toLowerCase().includes(q) ||
          (a.cardInUse || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.stt - b.stt);
  }, [accounts, search, filter, dailyAccountIds, selectedCard]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (a: Account) => {
    setEditing(a);
    setFormOpen(true);
  };

  const handleSubmit = (input: AccountInput) => {
    if (editing) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === editing.id ? { ...a, ...input } : a))
      );
    } else {
      setAccounts((prev) => {
        const nextStt = prev.length === 0 ? 1 : Math.max(...prev.map((a) => a.stt)) + 1;
        const newAccount: Account = { id: genId(), stt: nextStt, ...input };
        return [...prev, newAccount];
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setAccounts((prev) => prev.filter((a) => a.id !== targetId));
    if (selected?.id === targetId) setSelected(null);
    setDeleteTarget(null);
  };

  const handleAdvance = (account: Account) => {
    const next = nextWorkflowStatus(account.workflowStatus);
    if (next === account.workflowStatus) return;
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === account.id
          ? {
              ...a,
              workflowStatus: next,
              lunaTrialDate:
                next === 'luna_running' && !a.lunaTrialDate
                  ? todayISO()
                  : shouldKeepLunaDate(next)
                  ? a.lunaTrialDate
                  : null,
            }
          : a
      )
    );
  };

  const handleExport = () => {
    const csv = accountsToCSV(accounts);
    const date = todayISO();
    downloadCSV(`amazon-accounts-${date}.csv`, csv);
  };

  const isDailyView = filter === 'daily';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header onAdd={openAdd} onExport={handleExport} total={accounts.length} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Dashboard</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600">Tài khoản Amazon</span>
          </div>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Quản lý tài khoản Amazon
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi profile, mật khẩu và quy trình Prime / Luna Trial của đội nhóm.
          </p>
        </div>

        {/* Stats */}
        <StatsCards accounts={accounts} />

        {/* Warnings banner */}
        {showWarningsBanner && (
          <div className="mt-5">
            <WarningsBanner
              accounts={warningAccounts}
              onDismiss={() => setAlertDismissed(true)}
            />
          </div>
        )}

        {/* Toolbar */}
        <div className="mt-6">
          <Toolbar
            search={search}
            onSearch={setSearch}
            filter={filter}
            onFilter={setFilter}
            counts={counts}
          />
        </div>

        {/* Daily tasks Kanban or main split layout */}
        <div className="mt-4">
          {isDailyView ? (
            <DailyTasksView accounts={accounts} onAdvance={handleAdvance} />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
              <AccountsTable
                accounts={filtered}
                selectedId={selected?.id}
                onSelect={setSelected}
                onEdit={openEdit}
                onDelete={(a) => setDeleteTarget(a)}
                onAdvance={handleAdvance}
              />
              <div className="xl:sticky xl:top-20 xl:self-start">
                <CardUsageChart
                  accounts={accounts}
                  selectedCard={selectedCard}
                  onSelectCard={setSelectedCard}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          Amazon Accounts Manager · Quy trình Prime Trial → Luna Trial → Prime Trả Phí · Dữ liệu lưu cục bộ (LocalStorage)
        </footer>
      </main>

      <AccountDrawer
        account={selected}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
        onDelete={(a) => setDeleteTarget(a)}
        onAdvance={handleAdvance}
      />

      <AccountFormModal
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        account={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function shouldKeepLunaDate(status: WorkflowStatus): boolean {
  return status === 'luna_running' || status === 'prime_paid';
}
