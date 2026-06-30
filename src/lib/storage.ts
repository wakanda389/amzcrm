import type { Account, WorkflowStatus } from '../types';

const STORAGE_KEY = 'amazon-accounts-v3';

interface LegacyAccount {
  id: string;
  stt: number;
  profileName: string;
  email: string;
  emailPassword: string;
  amazonPassword: string;
  phone: string;
  registeredDate: string;
  primeStatus?: 'Chưa' | 'Rồi';
  primeTrialDate: string | null;
  notes?: string;
  workflowStatus?: WorkflowStatus;
  lunaTrialDate?: string | null;
  holderName?: string;
  address?: string;
  cardInUse?: string;
}

function migrate(raw: LegacyAccount): Account {
  let workflowStatus: WorkflowStatus = raw.workflowStatus ?? 'prime_running';
  if (!raw.workflowStatus && raw.primeStatus === 'Rồi') {
    workflowStatus = 'prime_running';
  } else if (!raw.workflowStatus && raw.primeStatus === 'Chưa') {
    workflowStatus = 'prime_running';
  }
  return {
    id: raw.id,
    stt: raw.stt,
    profileName: raw.profileName,
    email: raw.email,
    emailPassword: raw.emailPassword,
    amazonPassword: raw.amazonPassword,
    phone: raw.phone,
    registeredDate: raw.registeredDate,
    workflowStatus,
    primeTrialDate: raw.primeTrialDate ?? null,
    lunaTrialDate: raw.lunaTrialDate ?? null,
    notes: raw.notes ?? '',
    holderName: raw.holderName ?? '',
    address: raw.address ?? '',
    cardInUse: raw.cardInUse ?? '',
  };
}

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // try legacy keys
      for (const key of ['amazon-accounts-v2', 'amazon-accounts-v1']) {
        const legacy = localStorage.getItem(key);
        if (legacy) {
          const parsed = JSON.parse(legacy) as LegacyAccount[];
          if (Array.isArray(parsed)) return parsed.map(migrate);
        }
      }
      return [];
    }
    const parsed = JSON.parse(raw) as LegacyAccount[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrate);
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // ignore quota errors silently
  }
}

export function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
