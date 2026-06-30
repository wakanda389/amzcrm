import { ShoppingBag, Plus, Download } from 'lucide-react';

interface Props {
  onAdd: () => void;
  onExport: () => void;
  total: number;
}

export default function Header({ onAdd, onExport, total }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <ShoppingBag className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                Amazon Accounts Manager
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Quản lý tài khoản & Prime Trial · {total} profile
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Xuất File CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              <span>Thêm tài khoản</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
