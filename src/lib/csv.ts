import type { Account } from '../types';
import { WORKFLOW_STATUS_LABELS } from '../types';
import { formatDate } from './date';
import { primeExpiryISO, lunaExpiryISO } from './workflow';

function escapeCSV(value: string): string {
  const v = value ?? '';
  if (/[",\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function accountsToCSV(accounts: Account[]): string {
  const headers = [
    'STT',
    'Tên Profile',
    'Email',
    'Mật khẩu Email',
    'Mật khẩu Amazon',
    'Số điện thoại',
    'Ngày đăng ký',
    'Trạng thái quy trình',
    'Ngày kích Prime Trial',
    'Hạn Prime Trial',
    'Ngày kích Luna Trial',
    'Hạn Luna Trial',
    'Tên chủ tài khoản',
    'Địa chỉ',
    'Thẻ đang sử dụng',
    'Ghi chú',
  ];
  const rows = accounts.map((a) => {
    const primeExp = primeExpiryISO(a);
    const lunaExp = lunaExpiryISO(a);
    return [
      String(a.stt),
      a.profileName,
      a.email,
      a.emailPassword,
      a.amazonPassword,
      a.phone,
      formatDate(a.registeredDate),
      WORKFLOW_STATUS_LABELS[a.workflowStatus],
      a.primeTrialDate ? formatDate(a.primeTrialDate) : 'N/A',
      primeExp ? formatDate(primeExp) : 'N/A',
      a.lunaTrialDate ? formatDate(a.lunaTrialDate) : 'N/A',
      lunaExp ? formatDate(lunaExp) : 'N/A',
      a.holderName ?? '',
      a.address ?? '',
      a.cardInUse ?? '',
      a.notes ?? '',
    ].map(escapeCSV).join(',');
  });
  return [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
}

export function downloadCSV(filename: string, content: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
