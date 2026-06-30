import { Search, X, Filter, ClipboardList } from 'lucide-react';
import type { FilterTab } from '../types';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  filter: FilterTab;
  onFilter: (f: FilterTab) => void;
  counts: Record<FilterTab, number>;
}

const tabs: { key: FilterTab; label: string; highlight?: boolean }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'daily', label: 'Đầu việc hôm nay', highlight: true },
  { key: 'prime_running', label: 'Prime đang chạy' },
  { key: 'prime_cancelled', label: 'Đã hủy' },
  { key: 'need_luna', label: 'Cần Luna' },
  { key: 'luna_running', label: 'Luna đang chạy' },
  { key: 'prime_paid', label: 'Prime Trả Phí' },
];

export default function Toolbar({ search, onSearch, filter, onFilter, counts }: Props) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm theo Tên Profile hoặc Email..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />
        {search && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Xóa tìm kiếm"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
        <div className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:flex">
          <Filter className="h-3.5 w-3.5" />
          <span>Lọc:</span>
        </div>
        <div className="inline-flex flex-nowrap rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {tabs.map((t) => {
            const active = filter === t.key;
            const count = counts[t.key] ?? 0;
            const isDaily = t.key === 'daily';
            return (
              <button
                key={t.key}
                onClick={() => onFilter(t.key)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  active
                    ? isDaily
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-white shadow-sm'
                    : isDaily
                    ? 'text-blue-700 hover:bg-blue-50'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isDaily && <ClipboardList className="h-3.5 w-3.5" />}
                {t.label}
                <span
                  className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums ${
                    active
                      ? 'bg-white/20 text-white'
                      : isDaily
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
