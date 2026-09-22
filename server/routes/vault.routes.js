// server/routes/vault.routes.js — accounts, transactions, wire transfers, card controls
import { getDb } from '../db.js';
import { logAudit } from '../middleware.js';
import { newId } from '../auth.js';

function randomHash() {
  const a = Math.random().toString(16).slice(2, 6).padStart(4, '0');
  const b = Math.random().toString(16).slice(2, 6).padStart(4, '0');
  return `0x${a}...${b}`;
}

// GET /api/vault/accounts
export function getAccounts(req, res) {
  const db = getDb();
  const accounts = db.prepare(
    'SELECT * FROM accounts WHERE user_id = ? ORDER BY type'
  ).all(req.user.id);

  return res.json(200, { accounts: accounts.map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    accountNumber: a.account_number,
    balance: a.balance,
    currency: a.currency,
    yieldApy: a.yield_apy || undefined,
    location: a.location || undefined,
  }))});
}

// GET /api/vault/transactions?limit=50&offset=0
export function getTransactions(req, res) {
  const db = getDb();
  const limit = Math.min(parseInt(req.query?.limit || '50'), 200);
  const offset = parseInt(req.query?.offset || '0');

  const rows = db.prepare(`
    SELECT * FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.user.id, limit, offset);

  const total = db.prepare('SELECT COUNT(*) as n FROM transactions WHERE user_id = ?')
    .get(req.user.id).n;

  return res.json(200, {
    transactions: rows.map(t => ({
      id: t.id,
      date: t.date_label,
      description: t.description,
      amount: t.amount,
      category: t.category,
      status: t.status,
      hash: t.hash,
      createdAt: t.created_at,
    })),
    total,
    limit,
    offset,
  });
}

// POST /api/vault/wire
export function sendWire(req, res) {
  const { recipient, routing, amount } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';

  if (!recipient || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.json(400, { error: 'Invalid wire parameters' });
  }

  const db = getDb();
  const userId = req.user.id;

  // Check emergency lockdown
  if (req.user.emergency_lockdown) {
    logAudit(userId, 'WIRE_BLOCKED_LOCKDOWN', 'warn', { recipient, amount }, ip, ua);
    return res.json(403, { error: 'Emergency lockdown active — all wires suspended' });
  }

  const checkingAcc = db.prepare(
    "SELECT * FROM accounts WHERE user_id = ? AND type = 'checking'"
  ).get(userId);

  if (!checkingAcc) {
    return res.json(404, { error: 'Checking account not found' });
  }

  const amt = parseFloat(amount);
  if (checkingAcc.balance < amt) {
    logAudit(userId, 'WIRE_INSUFFICIENT_FUNDS', 'warn', { amount: amt, balance: checkingAcc.balance }, ip, ua);
    return res.json(422, { error: 'Insufficient funds in checking account' });
  }

  const balanceBefore = checkingAcc.balance;
  const balanceAfter = balanceBefore - amt;
  const txId = newId('tx_');
  const wireId = newId('wire_');
  const txHash = randomHash();
  const now = new Date();
  const dateLabel = `${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} EST`;

  try {
    db.exec('BEGIN');
    // Deduct from checking
    db.prepare('UPDATE accounts SET balance = ? WHERE id = ?')
      .run(balanceAfter, checkingAcc.id);

    // Insert transaction
    db.prepare(`
      INSERT INTO transactions (id, user_id, account_id, date_label, description, amount, category, status, hash)
      VALUES (?, ?, ?, 'Just now', ?, ?, 'Wire Transfer', 'Settled', ?)
    `).run(txId, userId, checkingAcc.id, `Outgoing Fedwire to ${recipient}`, -amt, txHash);

    // Insert wire record
    db.prepare(`
      INSERT INTO wire_transfers (id, user_id, transaction_id, recipient, routing, amount, balance_before, balance_after)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(wireId, userId, txId, recipient, routing || '021000021 (Federal Reserve NY)', amt, balanceBefore, balanceAfter);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('[wire] Transaction failed:', err.message);
    return res.json(500, { error: 'Wire transfer failed internally' });
  }
  logAudit(userId, 'WIRE_SENT', 'info', { wireId, recipient, amount: amt, balanceBefore, balanceAfter, hash: txHash }, ip, ua);

  const accounts = db.prepare('SELECT * FROM accounts WHERE user_id = ?').all(userId);
  const transactions = db.prepare(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(userId);

  return res.json(200, {
    ok: true,
    wireId,
    transactionId: txId,
    hash: txHash,
    balanceAfter,
    accounts: accounts.map(a => ({
      id: a.id, name: a.name, type: a.type,
      accountNumber: a.account_number, balance: a.balance,
      currency: a.currency, yieldApy: a.yield_apy || undefined,
      location: a.location || undefined,
    })),
    transactions: transactions.map(t => ({
      id: t.id, date: t.date_label, description: t.description,
      amount: t.amount, category: t.category, status: t.status, hash: t.hash,
    })),
  });
}

// POST /api/vault/card/lock
export function toggleCardLock(req, res) {
  const { lock } = req.body;
  const db = getDb();
  const userId = req.user.id;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';

  const locked = lock ? 1 : 0;
  db.prepare('UPDATE users SET card_locked = ? WHERE id = ?').run(locked, userId);

  const event = locked ? 'CARD_LOCKED' : 'CARD_UNLOCKED';
  logAudit(userId, event, 'info', { cardLocked: locked }, ip, ua);

  return res.json(200, { ok: true, cardLocked: !!locked });
}

// POST /api/vault/card/reveal
export function cardReveal(req, res) {
  const db = getDb();
  const userId = req.user.id;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';

  logAudit(userId, 'CARD_DETAILS_REVEALED', 'warn', { note: 'PCI audit — card number revealed in UI' }, ip, ua);
  return res.json(200, { ok: true });
}
