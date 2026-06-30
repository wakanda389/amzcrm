import type { Account } from '../types';
import { getWarnings } from './workflow';

export function getExpiringSoon(accounts: Account[]): Account[] {
  return accounts.filter((a) => getWarnings(a).length > 0);
}
