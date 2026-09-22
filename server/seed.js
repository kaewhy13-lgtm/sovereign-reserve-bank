// server/seed.js — seeds demo users + accounts + transactions on first run
import { getDb } from './db.js';
import { hashPassword, newId } from './auth.js';

const DEMO_USERS = [
  {
    id: 'usr_alexander',
    username: 'alexander.vanderbilt',
    email: 'alexander.v@sovereign-reserve.com',
    password: 'vault-alpha-8821',
    name: 'Alexander V.',
    tier: 'Personal Sovereign',
    account_number_masked: '•••• 8821',
    device_info: 'iPhone 16 Pro • Secure Enclave Active',
    accounts: [
      {
        id: 'acc_1',
        name: 'Sovereign Premier Checking',
        type: 'checking',
        account_number: 'SR-0088-2190-44',
        balance: 248821.50,
        currency: 'USD',
        yield_apy: null,
        location: null,
      },
      {
        id: 'acc_2',
        name: 'Treasury Liquid Reserve Account',
        type: 'treasury',
        account_number: 'SR-9940-1120-77',
        balance: 612450.00,
        currency: 'USD',
        yield_apy: '5.15% APY',
        location: null,
      },
      {
        id: 'acc_3',
        name: 'Allocated Bullion Vault (Zurich Freeport)',
        type: 'bullion',
        account_number: 'ZH-VAULT-B14',
        balance: 1420000.00,
        currency: 'USD (450 oz Fine Gold Bar)',
        yield_apy: null,
        location: 'Zurich Freeport Vault #B-14',
      },
    ],
    security_keys: [
      { id: 'sk_1', name: 'iPhone 16 Pro (Apple Secure Enclave)', type: 'Apple Secure Enclave', last_used: 'Just now', status: 'active' },
      { id: 'sk_2', name: 'Primary YubiKey 5C NFC (Physical Key)', type: 'YubiKey 5C NFC', last_used: 'Yesterday, 14:20 EST', status: 'active' },
      { id: 'sk_3', name: 'MacBook Pro M3 Max Enclave', type: 'FIDO2 WebAuthn', last_used: '3 days ago', status: 'standby' },
    ],
    transactions: [
      { id: 'tx_01', description: 'Incoming Fedwire from Apex Capital Partners', amount: 150000.00, category: 'Wire Transfer', status: 'Settled', date_label: 'Today, 08:30 EST' },
      { id: 'tx_02', description: 'Zurich Freeport Allocated Vault Storage Fee (Q4)', amount: -1250.00, category: 'Vault Storage', status: 'Settled', date_label: 'Oct 22, 2024' },
      { id: 'tx_03', description: 'Sovereign Treasury Monthly Yield Dividend', amount: 2631.85, category: 'Dividend', status: 'Settled', date_label: 'Oct 20, 2024' },
      { id: 'tx_04', description: 'Bespoke Armored Courier Transit (5th Ave to JFK)', amount: -850.00, category: 'Concierge Service', status: 'Settled', date_label: 'Oct 18, 2024' },
      { id: 'tx_05', description: 'High-Value Outgoing Dual-Key SWIFT Wire to Geneva', amount: -500000.00, category: 'Wire Transfer', status: 'Settled', date_label: 'Oct 15, 2024' },
    ],
  },
  {
    id: 'usr_vanderbilt_estate',
    username: 'trust.officer@vanderbilt.reserve',
    email: 'trust.desk@sovereign-reserve.com',
    password: 'vault-wealth-1904',
    name: 'Vanderbilt Dynasty Trust',
    tier: 'Private Wealth Reserve',
    account_number_masked: '•••• 1904',
    device_info: 'Hardware Token #SR-9941 • Zurich Enclave',
    accounts: [
      {
        id: 'acc_w1',
        name: 'Dynasty Wealth Checking',
        type: 'checking',
        account_number: 'SR-0019-0400-01',
        balance: 1420500.00,
        currency: 'USD',
        yield_apy: null,
        location: null,
      },
      {
        id: 'acc_w2',
        name: 'Dynasty Treasury Reserve',
        type: 'treasury',
        account_number: 'SR-8950-0000-88',
        balance: 8950000.00,
        currency: 'USD',
        yield_apy: '5.45% APY',
        location: null,
      },
      {
        id: 'acc_w3',
        name: 'Allocated Bullion Vault (Zurich Freeport)',
        type: 'bullion',
        account_number: 'ZH-VAULT-W22',
        balance: 8960000.00,
        currency: 'USD (2800 oz Fine Gold Bar)',
        yield_apy: null,
        location: 'Zurich Freeport Vault #W-22',
      },
    ],
    security_keys: [
      { id: 'sk_w1', name: 'Bloomberg Terminal Hardware Token #SR-9941', type: 'FIDO2 WebAuthn', last_used: 'Today, 08:15 EST', status: 'active' },
      { id: 'sk_w2', name: 'Zurich Enclave Key (Paradeplatz)', type: 'YubiKey 5C NFC', last_used: 'Oct 20, 2024', status: 'standby' },
    ],
    transactions: [
      { id: 'tx_w01', description: 'Incoming SWIFT from UBS Geneva Asset Management', amount: 2500000.00, category: 'Wire Transfer', status: 'Settled', date_label: 'Today, 08:15 EST' },
      { id: 'tx_w02', description: 'Zurich Allocated Vault Storage Fee (Annual)', amount: -8500.00, category: 'Vault Storage', status: 'Settled', date_label: 'Oct 20, 2024' },
      { id: 'tx_w03', description: 'Dynasty Trust Monthly Yield Dividend', amount: 40672.50, category: 'Dividend', status: 'Settled', date_label: 'Oct 18, 2024' },
      { id: 'tx_w04', description: 'Private Jet Charter — Zurich to Singapore', amount: -85000.00, category: 'Concierge Service', status: 'Settled', date_label: 'Oct 15, 2024' },
    ],
  },
  {
    id: 'usr_apex_holdings',
    username: 'treasury@apex-capital.corp',
    email: 'treasury@apex-capital.corp',
    password: 'vault-corp-4410',
    name: 'Apex Global Capital Corp',
    tier: 'Institutional Corporate',
    account_number_masked: '•••• 4410',
    device_info: 'HSM Multi-Sig Server • Dual-Key Approved',
    accounts: [
      {
        id: 'acc_c1',
        name: 'Corporate Treasury Checking',
        type: 'checking',
        account_number: 'SR-4410-0000-01',
        balance: 12450000.00,
        currency: 'USD',
        yield_apy: null,
        location: null,
      },
      {
        id: 'acc_c2',
        name: 'Institutional Reserve Account',
        type: 'treasury',
        account_number: 'SR-3420-0000-99',
        balance: 34200000.00,
        currency: 'USD',
        yield_apy: '5.60% APY',
        location: null,
      },
      {
        id: 'acc_c3',
        name: 'Allocated Bullion Depot (Singapore)',
        type: 'bullion',
        account_number: 'SG-MBFC-C01',
        balance: 20800000.00,
        currency: 'USD (6500 oz Fine Gold Bar)',
        yield_apy: null,
        location: 'Marina Bay Financial Centre Bullion Depot',
      },
    ],
    security_keys: [
      { id: 'sk_c1', name: 'HSM Primary Module (NYC Data Center)', type: 'FIDO2 WebAuthn', last_used: 'Today, 06:30 EST', status: 'active' },
      { id: 'sk_c2', name: 'HSM Backup (Singapore DC)', type: 'FIDO2 WebAuthn', last_used: 'Oct 21, 2024', status: 'standby' },
    ],
    transactions: [
      { id: 'tx_c01', description: 'Institutional SWIFT — Goldman Sachs Asset Management', amount: 5000000.00, category: 'Wire Transfer', status: 'Settled', date_label: 'Today, 06:30 EST' },
      { id: 'tx_c02', description: 'Singapore Bullion Depot Storage Fee (Q4)', amount: -32000.00, category: 'Vault Storage', status: 'Settled', date_label: 'Oct 22, 2024' },
      { id: 'tx_c03', description: 'Institutional Reserve Yield Dividend', amount: 190000.00, category: 'Dividend', status: 'Settled', date_label: 'Oct 20, 2024' },
      { id: 'tx_c04', description: 'Dual-Key SWIFT Wire to Swiss National Bank', amount: -8500000.00, category: 'Wire Transfer', status: 'Pending Dual-Auth', date_label: 'Oct 18, 2024' },
    ],
  },
];

function fakeHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (Math.imul(31, h) + str.charCodeAt(i)) | 0; }
  return '0x' + Math.abs(h).toString(16).padStart(4, '0') + '...' + Math.abs(h * 7).toString(16).padStart(4, '0');
}

export function seedDatabase() {
  const db = getDb();

  // Check if already seeded
  const existing = db.prepare('SELECT COUNT(*) as n FROM users').get();
  if (existing.n > 0) {
    console.log('[seed] Database already seeded — skipping.');
    return;
  }

  console.log('[seed] Seeding demo data...');

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, name, tier, account_number_masked, device_info)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAccount = db.prepare(`
    INSERT INTO accounts (id, user_id, name, type, account_number, balance, currency, yield_apy, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTx = db.prepare(`
    INSERT INTO transactions (id, user_id, account_id, date_label, description, amount, category, status, hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertKey = db.prepare(`
    INSERT INTO security_keys (id, user_id, name, type, added_date, last_used, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    db.exec('BEGIN');
    for (const u of DEMO_USERS) {
      insertUser.run(
        u.id, u.username, u.email,
        hashPassword(u.password),
        u.name, u.tier, u.account_number_masked, u.device_info
      );

      const checkingAccount = u.accounts[0];
      for (const acc of u.accounts) {
        insertAccount.run(
          acc.id, u.id, acc.name, acc.type,
          acc.account_number, acc.balance, acc.currency,
          acc.yield_apy || null, acc.location || null
        );
      }

      for (const tx of u.transactions) {
        insertTx.run(
          tx.id, u.id, checkingAccount.id,
          tx.date_label, tx.description, tx.amount,
          tx.category, tx.status,
          fakeHash(tx.id)
        );
      }

      for (const key of u.security_keys) {
        insertKey.run(
          key.id, u.id, key.name, key.type,
          'Jan 01, 2024', key.last_used, key.status
        );
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  console.log('[seed] Done — 3 users, 9 accounts, 11 transactions seeded.');
}
