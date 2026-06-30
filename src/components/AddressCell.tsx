import { useState } from 'react';
import { MapPin, Copy, Check } from 'lucide-react';

interface Props {
  address: string;
  maxChars?: number;
}

export default function AddressCell({ address, maxChars = 28 }: Props) {
  const [copied, setCopied] = useState(false);

  if (!address || !address.trim()) {
    return <span className="text-slate-300">—</span>;
  }

  const truncated = address.length > maxChars;
  const display = truncated ? address.slice(0, maxChars) + '…' : address;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div className="group flex items-center gap-1.5">
      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
      <span
        className="text-sm text-slate-600"
        title={address}
      >
        {display}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded p-1 text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
        aria-label="Sao chép địa chỉ"
        title="Sao chép địa chỉ"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
