export type WorkflowStatus =
  | 'prime_running'
  | 'prime_cancelled'
  | 'need_luna'
  | 'luna_running'
  | 'prime_paid';

export interface Account {
  id: string;
  stt: number;
  profileName: string;
  email: string;
  emailPassword: string;
  amazonPassword: string;
  phone: string;
  registeredDate: string; // ISO date (yyyy-mm-dd)
  workflowStatus: WorkflowStatus;
  primeTrialDate: string | null; // Ngày kích Prime Trial
  lunaTrialDate: string | null; // Ngày kích Luna Trial
  notes: string; // Ghi chú (free text)
  holderName: string; // Tên chủ tài khoản
  address: string; // Địa chỉ
  cardInUse: string; // Thẻ đang sử dụng (e.g., Visa...1234)
}

export type FilterTab = 'all' | 'daily' | 'prime_running' | 'prime_cancelled' | 'need_luna' | 'luna_running' | 'prime_paid';

export interface AccountInput {
  profileName: string;
  email: string;
  emailPassword: string;
  amazonPassword: string;
  phone: string;
  registeredDate: string;
  workflowStatus: WorkflowStatus;
  primeTrialDate: string | null;
  lunaTrialDate: string | null;
  notes: string;
  holderName: string;
  address: string;
  cardInUse: string;
}

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  prime_running: 'Prime Trial - Đang chạy',
  prime_cancelled: 'Prime Trial - Đã hủy (Chờ hết hạn)',
  need_luna: 'Cần kích Luna Trial',
  luna_running: 'Luna Trial - Đang chạy',
  prime_paid: 'Prime Trả Phí - Active',
};

export const WORKFLOW_ORDER: WorkflowStatus[] = [
  'prime_running',
  'prime_cancelled',
  'need_luna',
  'luna_running',
  'prime_paid',
];

export function nextWorkflowStatus(current: WorkflowStatus): WorkflowStatus {
  const idx = WORKFLOW_ORDER.indexOf(current);
  if (idx < 0 || idx >= WORKFLOW_ORDER.length - 1) return current;
  return WORKFLOW_ORDER[idx + 1];
}
