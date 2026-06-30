import { Account, Stage, STAGE_LABELS } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Crown, Moon, AlertTriangle } from 'lucide-react';

interface Props {
  accounts: Account[];
}

export default function AnalyticsTopSection({ accounts }: Props) {
  const totalProfiles = accounts.length;
  const totalActivePrime = accounts.filter(a => a.stage === 'prime_trial_running' || a.stage === 'prime_paid_active').length;
  const totalActiveLuna = accounts.filter(a => a.stage === 'luna_trial_running').length;

  const today = new Date();
  const urgent: Account[] = [];

  for (const a of accounts) {
    const start = new Date(a.stage_start_date);
    if (a.stage === 'prime_trial_running') {
      const days = 30 - Math.floor((today.getTime() - start.getTime()) / 86400000);
      if (days <= 3) urgent.push(a);
    } else if (a.stage === 'luna_trial_running') {
      const days = 7 - Math.floor((today.getTime() - start.getTime()) / 86400000);
      if (days <= 0) urgent.push(a);
    } else if (a.stage === 'luna_needed') {
      urgent.push(a);
    }
  }

  const cardUsage = [
    { name: 'Visa', value: accounts.filter(a => a.card_type?.toLowerCase().includes('visa')).length, color: '#1d4ed8' },
    { name: 'Mastercard', value: accounts.filter(a => a.card_type?.toLowerCase().includes('master')).length, color: '#dc2626' },
    { name: 'Amex', value: accounts.filter(a => a.card_type?.toLowerCase().includes('amex')).length, color: '#2563eb' },
    { name: 'JCB', value: accounts.filter(a => a.card_type?.toLowerCase().includes('jcb')).length, color: '#16a34a' },
    { name: 'Khác', value: accounts.filter(a => a.card_type && !['visa', 'master', 'amex', 'jcb'].some(t => a.card_type!.toLowerCase().includes(t))).length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  if (cardUsage.length === 0) {
    cardUsage.push({ name: 'Chưa có thẻ', value: 1, color: '#475569' });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="card p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{totalProfiles}</p>
          <p className="text-xs text-slate-400 mt-0.5">Tổng số Profile</p>
        </div>
      </div>

      <div className="card p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Crown className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{totalActivePrime}</p>
          <p className="text-xs text-slate-400 mt-0.5">Prime Active</p>
        </div>
      </div>

      <div className="card p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
          <Moon className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{totalActiveLuna}</p>
          <p className="text-xs text-slate-400 mt-0.5">Luna Active</p>
        </div>
      </div>

      <div className={`card p-4 flex items-center gap-4 ${urgent.length > 0 ? 'border-red-500/40 bg-red-500/10' : ''}`}>
        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{urgent.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Việc cần làm hôm nay</p>
        </div>
      </div>

      <div className="card p-4 md:col-span-2 lg:col-span-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Tỷ lệ dùng thẻ</h3>
          <div className="flex flex-wrap gap-3">
            {cardUsage.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-slate-400">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cardUsage}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
                strokeWidth={0}
              >
                {cardUsage.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#e2e8f0',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
