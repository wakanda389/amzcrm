import { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface Props {
  value: string;
  label: string;
}

export default function PasswordCell({ value, label }: Props) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`font-mono text-sm tabular-nums ${
          visible ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        {visible ? value : '••••••••'}
      </span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setVisible((v) => !v);
          }}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label={visible ? `Ẩn ${label}` : `Hiện ${label}`}
          title={visible ? 'Ẩn' : 'Hiện'}
        >
          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label={`Sao chép ${label}`}
          title="Sao chép"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
