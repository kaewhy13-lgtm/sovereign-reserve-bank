// server/db.js — SQLite setup using Node.js 24 built-in node:sqlite
import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'bank.db');

let _db = null;

export function getDb() {
  if (_db) return _db;

  _db = new DatabaseSync(DB_PATH);

  // Enable WAL mode for performance + foreign keys
  _db.exec('PRAGMA journal_mode = WAL;');
  _db.exec('PRAGMA foreign_keys = ON;');

  createTables(_db);
  return _db;
}

function createTables(db) {
  db.exec(`
    -- ─────────────────────────────────────────────
    -- USERS — one row per registered account
    -- ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id                TEXT PRIMARY KEY,
      username          TEXT NOT NULL UNIQUE,
      email             TEXT NOT NULL,
      password_hash     TEXT NOT NULL,
      name              TEXT NOT NULL,
      tier              TEXT NOT NULL,
      account_number_masked TEXT NOT NULL,
      device_info       TEXT,
      created_at        TEXT NOT NULL DEFAULT (datetime('now')),
      last_login        TEXT,
      card_locked       INTEGER NOT NULL DEFAULT 0,
      emergency_lockdown INTEGER NOT NULL DEFAULT 0
    );

    -- ─────────────────────────────────────────────
    -- SESSIONS — every authenticated session
    -- ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS sessions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id),
      token_hash  TEXT NOT NULL,
      ip          TEXT,
      user_agent  TEXT,
      method      TEXT NOT NULL DEFAULT 'password',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at  TEXT NOT NULL,
      revoked     INTEGER NOT NULL DEFAULT 0,
      revoked_at  TEXT
    );

    -- ─────────────────────────────────────────────
    -- ACCOUNTS — bank accounts per user
    -- ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS accounts (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id),
      name        TEXT NOT NULL,
      type        TEXT NOT NULL,
      account_number TEXT NOT NULL,
      balance     REAL NOT NULL DEFAULT 0,
      currency    TEXT NOT NULL DEFAULT 'USD',
      yield_apy   TEXT,
      location    TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ─────────────────────────────────────────────
    -- TRANSACTIONS — immutable ledger
    -- ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS transactions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id),
      account_id  TEXT REFERENCES accounts(id),
      date_label  TEXT NOT NULL,
      description TEXT NOT NULL,
      amount      REAL NOT NULL,
      category    TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'Settled',
      hash        TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ─────────────────────────────────────────────
    -- WIRE_TRANSFERS — detailed wire records
    -- ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS wire_transfers (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES users(id),
      transaction_id TEXT REFERENCES transactions(id),
      recipient     TEXT NOT NULL,
      routing       TEXT NOT NULL,
      amount        REAL NOT NULL,
      balance_before REAL NOT NULL,
      balance_after  REAL NOT NULL,
      status        TEXT NOT NULL DEFAULT 'Settled',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ─────────────────────────────────────────────
    -- SECURITY_KEYS — FIDO2 hardware passkeys
    -- ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS security_keys (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id),
      name        TEXT NOT NULL,
      type        TEXT NOT NULL DEFAULT 'YubiKey 5C NFC',
      added_date  TEXT NOT NULL DEFAULT (date('now')),
      last_used   TEXT,
      status      TEXT NOT NULL DEFAULT 'active',
      revoked     INTEGER NOT NULL DEFAULT 0,
      revoked_at  TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ─────────────────────────────────────────────
    -- CARD_ACTIVATIONS — every card activation event
    -- ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS card_activations (
      id          TEXT PRIMARY KEY,
      user_id     TEXT REFERENCES users(id),
      card_last4  TEXT NOT NULL,
      ip          TEXT,
      user_agent  TEXT,
      success     INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ─────────────────────────────────────────────
    -- AUDIT_LOG — every significant event
    -- ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS audit_log (
      id          TEXT PRIMARY KEY,
      user_id     TEXT REFERENCES users(id),
      event       TEXT NOT NULL,
      severity    TEXT NOT NULL DEFAULT 'info',
      meta        TEXT,
      ip          TEXT,
      user_agent  TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ─────────────────────────────────────────────
    -- CONCIERGE_REQUESTS — support contact events
    -- ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS concierge_requests (
      id          TEXT PRIMARY KEY,
      user_id     TEXT REFERENCES users(id),
      subject     TEXT NOT NULL,
      message     TEXT,
      ip          TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes for fast queries
    CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token   ON sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_accounts_user    ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_tx_user          ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_tx_created       ON transactions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_keys_user        ON security_keys(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_user       ON audit_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created    ON audit_log(created_at DESC);
  `);
}
