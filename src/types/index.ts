export interface Account {
  id: string
  profile_name: string
  email: string
  password: string
  owner_name: string | null
  phone: string | null
  card_type: string | null
  card_last4: string | null
  address: string | null
  notes: string | null
  stage: Stage
  stage_start_date: string
  created_at: string
  updated_at: string
}

export type Stage =
  | 'prime_trial_running'
  | 'prime_trial_cancelled'
  | 'luna_needed'
  | 'luna_trial_running'
  | 'prime_paid_active'

export const STAGE_LABELS: Record<Stage, string> = {
  prime_trial_running: 'Prime Trial - Đang chạy',
  prime_trial_cancelled: 'Prime Trial - Đã hủy (Chờ hết hạn)',
  luna_needed: 'Cần kích Luna Trial',
  luna_trial_running: 'Luna Trial - Đang chạy',
  prime_paid_active: 'Prime Trả Phí - Active',
}

export const STAGE_COLORS: Record<Stage, string> = {
  prime_trial_running: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  prime_trial_cancelled: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  luna_needed: 'bg-red-500/20 text-red-400 border-red-500/30',
  luna_trial_running: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  prime_paid_active: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

export const STAGE_ORDER: Stage[] = [
  'prime_trial_running',
  'prime_trial_cancelled',
  'luna_needed',
  'luna_trial_running',
  'prime_paid_active',
]

export const CSV_HEADERS = [
  'profile_name',
  'email',
  'password',
  'owner_name',
  'phone',
  'card_type',
  'card_last4',
  'address',
  'notes',
  'stage',
  'stage_start_date',
]

export const CSV_HEADER_LABELS: Record<string, string> = {
  profile_name: 'Tên Profile',
  email: 'Email',
  password: 'Mật khẩu',
  owner_name: 'Tên chủ TK',
  phone: 'SĐT',
  card_type: 'Loại thẻ',
  card_last4: '4 số cuối',
  address: 'Địa chỉ',
  notes: 'Ghi chú',
  stage: 'Giai đoạn',
  stage_start_date: 'Ngày bắt đầu',
}
