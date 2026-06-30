import type { Account } from '../types';

export function seedAccounts(): Account[] {
  const today = new Date();
  const iso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const reg1 = new Date(today); reg1.setDate(reg1.getDate() - 40);
  const prime1 = new Date(today); prime1.setDate(prime1.getDate() - 28);

  const reg2 = new Date(today); reg2.setDate(reg2.getDate() - 45);
  const prime2 = new Date(today); prime2.setDate(prime2.getDate() - 35);

  const reg3 = new Date(today); reg3.setDate(reg3.getDate() - 50);
  const prime3 = new Date(today); prime3.setDate(prime3.getDate() - 40);
  const luna3 = new Date(today); luna3.setDate(luna3.getDate() - 8);

  const reg4 = new Date(today); reg4.setDate(reg4.getDate() - 20);
  const prime4 = new Date(today); prime4.setDate(prime4.getDate() - 15);

  const reg5 = new Date(today); reg5.setDate(reg5.getDate() - 60);
  const prime5 = new Date(today); prime5.setDate(prime5.getDate() - 45);
  const luna5 = new Date(today); luna5.setDate(luna5.getDate() - 3);

  return [
    {
      id: 'seed-1',
      stt: 1,
      profileName: 'Amazon US - Minh Nguyễn',
      email: 'minh.nguyen.amazon@gmail.com',
      emailPassword: 'Minh@2024!secure',
      amazonPassword: 'Amazon#Minh2024',
      phone: '+1 (415) 555-0142',
      registeredDate: iso(reg1),
      workflowStatus: 'prime_running',
      primeTrialDate: iso(prime1),
      lunaTrialDate: null,
      notes: 'Tài khoản chính cho thị trường Mỹ. Cần hủy Prime Trial trước khi hết hạn.',
      holderName: 'Minh Nguyễn Văn',
      address: '1234 Market St, Apt 5B, San Francisco, CA 94103, USA',
      cardInUse: 'Visa •••• 1234',
    },
    {
      id: 'seed-2',
      stt: 2,
      profileName: 'Amazon JP - Linh Trần',
      email: 'linhtran.jp@outlook.com',
      emailPassword: 'LinhJP!2024#pass',
      amazonPassword: 'AmazonLinhJP2024',
      phone: '+81 90-1234-5678',
      registeredDate: iso(reg2),
      workflowStatus: 'need_luna',
      primeTrialDate: iso(prime2),
      lunaTrialDate: null,
      notes: 'Prime Trial đã hết hạn. Sẵn sàng kích Luna Trial 7 ngày.',
      holderName: 'Trần Thị Linh',
      address: '2-1-1 Shibuya, Shibuya-ku, Tokyo 150-0002, Japan',
      cardInUse: 'Mastercard •••• 5678',
    },
    {
      id: 'seed-3',
      stt: 3,
      profileName: 'Amazon UK - Hoàng Phạm',
      email: 'hoang.pham.uk@yahoo.com',
      emailPassword: 'HoangUK!2024#pass',
      amazonPassword: 'AmazonHoangUK2024',
      phone: '+44 7700 900123',
      registeredDate: iso(reg3),
      workflowStatus: 'luna_running',
      primeTrialDate: iso(prime3),
      lunaTrialDate: iso(luna3),
      notes: 'Luna Trial đã hết hạn. Cần lên Prime Trả Phí ngay hôm nay.',
      holderName: 'Phạm Quốc Hoàng',
      address: '45 Baker Street, London W1U 7EW, United Kingdom',
      cardInUse: 'Visa •••• 1234',
    },
    {
      id: 'seed-4',
      stt: 4,
      profileName: 'Amazon DE - Mai Lê',
      email: 'mai.le.de@gmx.de',
      emailPassword: 'MaiDE!2024#pass',
      amazonPassword: 'AmazonMaiDE2024',
      phone: '+49 151 23456789',
      registeredDate: iso(reg4),
      workflowStatus: 'prime_running',
      primeTrialDate: iso(prime4),
      lunaTrialDate: null,
      notes: 'Prime Trial đang chạy bình thường, còn 15 ngày.',
      holderName: 'Lê Thu Mai',
      address: 'Kurfürstendamm 100, 10709 Berlin, Germany',
      cardInUse: 'Amex •••• 9012',
    },
    {
      id: 'seed-5',
      stt: 5,
      profileName: 'Amazon FR - Tuấn Vũ',
      email: 'tuan.vu.fr@laposte.fr',
      emailPassword: 'TuanFR!2024#pass',
      amazonPassword: 'AmazonTuanFR2024',
      phone: '+33 6 12 34 56 78',
      registeredDate: iso(reg5),
      workflowStatus: 'luna_running',
      primeTrialDate: iso(prime5),
      lunaTrialDate: iso(luna5),
      notes: 'Luna Trial đang chạy, còn 4 ngày nữa hết hạn.',
      holderName: 'Vũ Anh Tuấn',
      address: '12 Rue de Rivoli, 75004 Paris, France',
      cardInUse: 'Mastercard •••• 5678',
    },
  ];
}
