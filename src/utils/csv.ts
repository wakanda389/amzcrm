import Papa from 'papaparse';

export interface Account {
  id?: string;
  profile_name: string;
  email: string;
  email_password?: string;
  amazon_password?: string;
  phone?: string;
  register_date?: string;
  account_holder_name?: string;
  address?: string;
  card_used?: string;
  notes?: string;
  status: string;
  prime_activation_date?: string;
  luna_activation_date?: string;
  created_at?: string;
}

export const CSV_HEADERS = [
  'profile_name', 'email', 'email_password', 'amazon_password', 'phone',
  'register_date', 'account_holder_name', 'address', 'card_used', 'notes', 'status',
  'prime_activation_date', 'luna_activation_date'
];

export const CSV_HEADER_LABELS: Record<string, string> = {
  profile_name: 'Tên Profile',
  email: 'Email',
  email_password: 'Mật khẩu Email',
  amazon_password: 'Mật khẩu Amazon',
  phone: 'Số điện thoại',
  register_date: 'Ngày đăng ký',
  account_holder_name: 'Tên chủ tài khoản',
  address: 'Địa chỉ',
  card_used: 'Thẻ đang sử dụng',
  notes: 'Ghi chú',
  status: 'Trạng thái',
  prime_activation_date: 'Ngày kích Prime Trial',
  luna_activation_date: 'Ngày kích Luna Trial'
};

// Hàm tải file mẫu CSV chuẩn cho người dùng điền dữ liệu
export const downloadSampleCSV = () => {
  const sampleData = [
    {
      profile_name: 'Profile_001',
      email: 'example1@gmail.com',
      email_password: 'pass_email_123',
      amazon_password: 'pass_amazon_123',
      phone: '0912345678',
      register_date: '2026-06-30',
      account_holder_name: 'Nguyen Van A',
      address: '123 Duong Le Loi, Q1, HCM',
      card_used: 'Visa...1234',
      notes: 'Tai khoan dung thu',
      status: 'Prime Trial - Đang chạy',
      prime_activation_date: '2026-06-30',
      luna_activation_date: ''
    }
  ];

  const csv = Papa.unparse({
    fields: CSV_HEADERS,
    data: sampleData.map(item => CSV_HEADERS.map(header => item[header as keyof typeof item] || ''))
  });

  // Thêm BOM để Excel đọc được tiếng Việt UTF-8 không bị lỗi font
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'amazon_crm_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Hàm xử lý đọc file CSV khi upload lên hệ thống
export const parseCSV = (file: File): Promise<Partial<Account>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedAccounts = results.data.map((row: any) => {
          return {
            profile_name: row.profile_name || row['Tên Profile'] || '',
            email: row.email || row['Email'] || '',
            email_password: row.email_password || row['Mật khẩu Email'] || '',
            amazon_password: row.amazon_password || row['Mật khẩu Amazon'] || '',
            phone: row.phone || row['Số điện thoại'] || '',
            register_date: row.register_date || row['Ngày đăng ký'] || '',
            account_holder_name: row.account_holder_name || row['Tên chủ tài khoản'] || '',
            address: row.address || row['Địa chỉ'] || '',
            card_used: row.card_used || row['Thẻ đang sử dụng'] || '',
            notes: row.notes || row['Ghi chú'] || '',
            status: row.status || row['Trạng thái'] || 'Prime Trial - Đang chạy',
            prime_activation_date: row.prime_activation_date || row['Ngày kích Prime Trial'] || '',
            luna_activation_date: row.luna_activation_date || row['Ngày kích Luna Trial'] || ''
          };
        });
        resolve(parsedAccounts);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
