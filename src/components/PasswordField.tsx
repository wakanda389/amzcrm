import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  password: string;
}

export default function PasswordField({ password }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-slate-300">
        {visible ? password : '•'.repeat(Math.min(password.length, 12))}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setVisible(!visible);
        }}
        className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
        title={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
