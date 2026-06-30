import { AccountInsert, CSV_HEADERS, CSV_HEADER_LABELS } from '../types';
import Papa from 'papaparse';

export function generateSampleCSV(): string {
  const headers = CSV_HEADERS.map(h => CSV_HEADER_LABELS[h]).join(',');
  const rows = [
    'Profile 01,email1@gmail.com,password123,Nguyen Van A,0912345678,Visa,1234,123 Nguyen Trai, Gò Vấp, TP.HCM,Prime đang chạy,prime_trial_running,' + new Date().toISOString().split('T')[0],
    'Profile 02,email2@gmail.com,pass456,Tran Thi B,0987654321,Mastercard,5678,456 Le Lai, Q1, TP.HCM,Đã hủy Prime chờ hết hạn,prime_trial_cancelled,' + new Date().toISOString().split('T')[0],
    'Profile 03,email3@gmail.com,secret789,Le Van C,0909123456,Visa,9012,789 Phan Xich Long, Phú Nhuận, TP.HCM,Cần kích Luna,luna_needed,' + new Date().toISOString().split('T')[0],
  ];
  return [headers, ...rows].join('\n');
}

export function downloadSampleCSV() {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'mau_nhap_tai_khoan.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function parseCSV(file: File): Promise<AccountInsert[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        const accounts: AccountInsert[] = [];
        for (const row of rows) {
          const account: AccountInsert = { profile_name: '', email: '', password: '' };
          for (const key of CSV_HEADERS) {
            const label = CSV_HEADER_LABELS[key];
            const value = row[label] || row[key] || '';
            if (key === 'stage_start_date') {
              (account as Record<string, unknown>)[key] = value || new Date().toISOString().split('T')[0];
            } else {
              (account as Record<string, unknown>)[key] = value;
            }
          }
          if (account.profile_name && account.email && account.password) {
            accounts.push(account);
          }
        }
        resolve(accounts);
      },
      error: (err) => reject(err),
    });
  });
}
