// server/routes/security.routes.js — passkeys, sessions, emergency lockdown
import { getDb } from '../db.js';
import { logAudit } from '../middleware.js';
import { newId } from '../auth.js';

// GET /api/security/keys
export function getKeys(req, res) {
  const db = getDb();
  const keys = db.prepare(
    'SELECT * FROM security_keys WHERE user_id = ? AND revoked = 0 ORDER BY created_at'
  ).all(req.user.id);

  return res.json(200, {
    keys: keys.map(k => ({
      id: k.id,
      name: k.name,
      type: k.type,
      addedDate: k.added_date,
      lastUsed: k.last_used || 'Never',
      status: k.status,
    }))
  });
}

// POST /api/security/keys
export function addKey(req, res) {
  const { name, type } = req.body;
  const db = getDb();
  const userId = req.user.id;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';

  if (!name?.trim()) {
    return res.json(400, { error: 'Key name is required' });
  }

  const keyType = type || 'YubiKey 5C NFC';
  const validTypes = ['FIDO2 WebAuthn', 'Apple Secure Enclave', 'YubiKey 5C NFC'];
  if (!validTypes.includes(keyType)) {
    return res.json(400, { error: 'Invalid key type' });
  }

  const keyId = newId('sk_');
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  db.prepare(`
    INSERT INTO security_keys (id, user_id, name, type, added_date, last_used, status)
    VALUES (?, ?, ?, ?, ?, 'Registered', 'active')
  `).run(keyId, userId, name.trim(), keyType, today);

  logAudit(userId, 'PASSKEY_ENROLLED', 'info', { keyId, name: name.trim(), type: keyType }, ip, ua);

  return res.json(201, {
    key: {
      id: keyId,
      name: name.trim(),
      type: keyType,
      addedDate: today,
      lastUsed: 'Registered',
      status: 'active',
    }
  });
}

// DELETE /api/security/keys/:id
export function revokeKey(req, res) {
  const { id } = req.params;
  const db = getDb();
  const userId = req.user.id;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';

  const key = db.prepare('SELECT * FROM security_keys WHERE id = ? AND user_id = ?').get(id, userId);
  if (!key) {
    return res.json(404, { error: 'Security key not found' });
  }

  db.prepare('UPDATE security_keys SET revoked = 1, revoked_at = ?, status = ? WHERE id = ?')
    .run(new Date().toISOString(), 'revoked', id);

  logAudit(userId, 'PASSKEY_REVOKED', 'warn', { keyId: id, name: key.name }, ip, ua);

  return res.json(200, { ok: true });
}

// GET /api/security/sessions
export function getSessions(req, res) {
  const db = getDb();
  const sessions = db.prepare(`
    SELECT id, ip, user_agent, method, created_at, expires_at, revoked
    FROM sessions
    WHERE user_id = ? AND revoked = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC
    LIMIT 20
  `).all(req.user.id);

  return res.json(200, {
    sessions: sessions.map(s => ({
      id: s.id,
      ip: s.ip,
      userAgent: s.user_agent,
      method: s.method,
      createdAt: s.created_at,
      expiresAt: s.expires_at,
    }))
  });
}

// DELETE /api/security/sessions/:id
export function terminateSession(req, res) {
  const { id } = req.params;
  const db = getDb();
  const userId = req.user.id;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';

  // Can't revoke your own current session via this endpoint
  if (id === req.sessionId) {
    return res.json(400, { error: 'Cannot terminate current session via this endpoint. Use /logout.' });
  }

  const session = db.prepare('SELECT id FROM sessions WHERE id = ? AND user_id = ?').get(id, userId);
  if (!session) {
    return res.json(404, { error: 'Session not found' });
  }

  db.prepare('UPDATE sessions SET revoked = 1, revoked_at = ? WHERE id = ?')
    .run(new Date().toISOString(), id);

  logAudit(userId, 'SESSION_TERMINATED', 'info', { targetSessionId: id }, ip, ua);
  return res.json(200, { ok: true });
}

// POST /api/security/lockdown
export function toggleLockdown(req, res) {
  const { armed } = req.body;
  const db = getDb();
  const userId = req.user.id;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';

  const newState = armed ? 1 : 0;
  db.prepare('UPDATE users SET emergency_lockdown = ? WHERE id = ?').run(newState, userId);

  const event = newState ? 'EMERGENCY_LOCKDOWN_ARMED' : 'EMERGENCY_LOCKDOWN_DISARMED';
  logAudit(userId, event, 'critical', { armed: newState }, ip, ua);

  return res.json(200, { ok: true, emergencyLockdown: !!newState });
}
