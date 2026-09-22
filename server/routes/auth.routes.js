// server/routes/auth.routes.js — login, logout, register, /me
import { getDb } from '../db.js';
import { hashPassword, comparePassword, signToken, hashToken, newId } from '../auth.js';
import { logAudit } from '../middleware.js';

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
}

function buildProfile(user, db) {
  const accounts = db.prepare('SELECT * FROM accounts WHERE user_id = ?').all(user.id);
  const checking = accounts.find(a => a.type === 'checking');
  const reserve  = accounts.find(a => a.type === 'treasury');
  const bullion  = accounts.find(a => a.type === 'bullion');
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    tier: user.tier,
    accountNumberMasked: user.account_number_masked,
    deviceInfo: user.device_info,
    lastAccess: user.last_login || 'First login',
    balancePreview: {
      checking: checking?.balance ?? 0,
      reserve:  reserve?.balance  ?? 0,
      bullionOz: bullion ? Math.round(bullion.balance / 3160) : 0,
    },
  };
}

// POST /api/auth/login
export function login(req, res) {
  const { username, password, rememberMe } = req.body;
  const ip = getClientIp(req);
  const ua = req.headers['user-agent'] || 'unknown';

  if (!username || !password) {
    return res.json(400, { error: 'Username and password required' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    logAudit(null, 'LOGIN_FAILED', 'warn', { username, reason: 'user_not_found' }, ip, ua);
    return res.json(401, { error: 'Invalid credentials' });
  }

  let passwordValid = false;
  try {
    passwordValid = comparePassword(password, user.password_hash);
  } catch (e) {
    logAudit(user.id, 'LOGIN_FAILED', 'warn', { reason: 'password_compare_error' }, ip, ua);
    return res.json(401, { error: 'Invalid credentials' });
  }

  if (!passwordValid) {
    logAudit(user.id, 'LOGIN_FAILED', 'warn', { reason: 'wrong_password' }, ip, ua);
    return res.json(401, { error: 'Invalid credentials' });
  }

  // Create session
  const sessionId = newId('sess_');
  const expiresHours = rememberMe ? 720 : 24; // 30 days or 1 day
  const token = signToken({ userId: user.id, sessionId }, expiresHours);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + expiresHours * 3600000).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, ip, user_agent, method, expires_at)
    VALUES (?, ?, ?, ?, ?, 'password', ?)
  `).run(sessionId, user.id, tokenHash, ip, ua, expiresAt);

  // Update last_login
  db.prepare('UPDATE users SET last_login = ? WHERE id = ?')
    .run(new Date().toISOString(), user.id);

  logAudit(user.id, 'LOGIN_SUCCESS', 'info', { method: 'password', sessionId }, ip, ua);

  const profile = buildProfile(user, db);

  return res.json(200, {
    token,
    profile,
    sessionId,
    expiresAt,
  });
}

// POST /api/auth/biometric
export function biometricLogin(req, res) {
  const { userId } = req.body;
  const ip = getClientIp(req);
  const ua = req.headers['user-agent'] || 'unknown';

  if (!userId) {
    return res.json(400, { error: 'userId required' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (!user) {
    logAudit(null, 'BIOMETRIC_FAILED', 'warn', { userId, reason: 'user_not_found' }, ip, ua);
    return res.json(401, { error: 'Invalid user' });
  }

  // Check for an active security key
  const activeKey = db.prepare(
    "SELECT * FROM security_keys WHERE user_id = ? AND status = 'active' AND revoked = 0"
  ).get(user.id);

  if (!activeKey) {
    logAudit(user.id, 'BIOMETRIC_FAILED', 'warn', { reason: 'no_active_key' }, ip, ua);
    return res.json(401, { error: 'No active biometric key registered' });
  }

  // Update last used
  db.prepare("UPDATE security_keys SET last_used = ? WHERE id = ?")
    .run(new Date().toISOString(), activeKey.id);

  const sessionId = newId('sess_bio_');
  const token = signToken({ userId: user.id, sessionId }, 24);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 86400000).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, ip, user_agent, method, expires_at)
    VALUES (?, ?, ?, ?, ?, 'biometric', ?)
  `).run(sessionId, user.id, tokenHash, ip, ua, expiresAt);

  db.prepare('UPDATE users SET last_login = ? WHERE id = ?')
    .run(new Date().toISOString(), user.id);

  logAudit(user.id, 'BIOMETRIC_SUCCESS', 'info', { keyId: activeKey.id, sessionId }, ip, ua);

  const profile = buildProfile(user, db);
  return res.json(200, { token, profile, sessionId, expiresAt });
}

// POST /api/auth/logout
export function logout(req, res) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const ip = getClientIp(req);
  const ua = req.headers['user-agent'] || 'unknown';

  if (!token) return res.json(200, { ok: true });

  const db = getDb();
  const th = hashToken(token);

  const session = db.prepare('SELECT id, user_id FROM sessions WHERE token_hash = ?').get(th);
  if (session) {
    db.prepare('UPDATE sessions SET revoked = 1, revoked_at = ? WHERE id = ?')
      .run(new Date().toISOString(), session.id);
    logAudit(session.user_id, 'LOGOUT', 'info', { sessionId: session.id }, ip, ua);
  }

  return res.json(200, { ok: true });
}

// POST /api/auth/register — new card activation / first-time setup
export function register(req, res) {
  const { cardLastFour, cvv, ssnLast4, name, username, email, password, tier } = req.body;
  const ip = getClientIp(req);
  const ua = req.headers['user-agent'] || 'unknown';

  if (!cardLastFour || !cvv || !ssnLast4) {
    return res.json(400, { error: 'Card last 4, CVV, and SSN last 4 required' });
  }

  const db = getDb();

  // For demo: registration creates a new user if username provided, or matches existing card
  if (username) {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      logAudit(existing.id, 'REGISTER_DUPLICATE', 'warn', { username }, ip, ua);
      return res.json(409, { error: 'Username already exists' });
    }

    const userId = newId('usr_');
    const displayName = name || username.split('@')[0].replace(/[._]/g, ' ');
    const masked = `•••• ${cardLastFour}`;
    const userTier = tier || 'Personal Sovereign';

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, name, tier, account_number_masked, device_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username, email || `${username}@sovereign-reserve.com`,
       hashPassword(password || 'changeme'), displayName, userTier, masked, ua);

    // Create default checking account
    const accId = newId('acc_');
    db.prepare(`
      INSERT INTO accounts (id, user_id, name, type, account_number, balance, currency)
      VALUES (?, ?, ?, 'checking', ?, 0, 'USD')
    `).run(accId, userId, 'Sovereign Premier Checking', `SR-${cardLastFour}-0000-01`);

    // Record card activation
    db.prepare(`
      INSERT INTO card_activations (id, user_id, card_last4, ip, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `).run(newId('cact_'), userId, cardLastFour, ip, ua);

    logAudit(userId, 'REGISTER_SUCCESS', 'info', { cardLastFour, tier: userTier }, ip, ua);

    // Auto-login
    const sessionId = newId('sess_');
    const token = signToken({ userId, sessionId }, 24);
    const tokenHash = hashToken(token);
    db.prepare(`
      INSERT INTO sessions (id, user_id, token_hash, ip, user_agent, method, expires_at)
      VALUES (?, ?, ?, ?, ?, 'register', ?)
    `).run(sessionId, userId, tokenHash, ip, ua, new Date(Date.now() + 86400000).toISOString());

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const profile = buildProfile(user, db);
    return res.json(201, { token, profile, sessionId });
  }

  // Demo card activation for existing users (just log the event)
  logAudit(null, 'CARD_ACTIVATION_ATTEMPT', 'info', { cardLastFour }, ip, ua);
  db.prepare(`
    INSERT INTO card_activations (id, user_id, card_last4, ip, user_agent)
    VALUES (?, NULL, ?, ?, ?)
  `).run(newId('cact_'), cardLastFour, ip, ua);

  return res.json(200, { ok: true, message: 'Card activation logged' });
}

// GET /api/auth/me
export function getMe(req, res) {
  const db = getDb();
  const user = req.user;
  const profile = buildProfile(user, db);
  return res.json(200, { profile });
}
