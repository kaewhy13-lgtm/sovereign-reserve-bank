export type TabType = 'personal' | 'wealth' | 'corporate';

export type MainNavTab = 'vault' | 'security' | 'support' | 'branches';

export interface MonthlySpending {
  month: string;
  wires: number;
  vaultStorage: number;
  concierge: number;
  total: number;
}

export interface UserProfile {
  id: string;
  name: string;
  accountNumberMasked: string;
  username: string;
  email: string;
  tier: 'Personal Sovereign' | 'Private Wealth Reserve' | 'Institutional Corporate';
  lastAccess: string;
  deviceInfo: string;
  balancePreview: {
    checking: number;
    reserve: number;
    bullionOz: number;
  };
  spendingTrends: MonthlySpending[];
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'treasury' | 'bullion' | 'credit';
  accountNumber: string;
  balance: number;
  currency: string;
  yieldApy?: string;
  location?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Wire Transfer' | 'Dividend' | 'Vault Storage' | 'Concierge Service' | 'Debit' | 'Deposit';
  status: 'Settled' | 'Pending Dual-Auth' | 'Clearing';
  hash: string;
}

export interface SecurityKeyItem {
  id: string;
  name: string;
  type: 'FIDO2 WebAuthn' | 'Apple Secure Enclave' | 'YubiKey 5C NFC';
  addedDate: string;
  lastUsed: string;
  status: 'active' | 'standby';
}

export interface BranchLocation {
  id: string;
  city: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  features: string[];
  hasBullionVault: boolean;
  hasPrivateDining: boolean;
  status: 'Open' | 'By Appointment' | 'Closed';
}
