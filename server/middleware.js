// server/middleware.js — request auth + audit logging helpers
import { verifyToken, hashToken, newId } from './auth.js';
import { getDb } from './db.js';

// ─────────────────────────────────────────────
// requireAuth — validates Bearer JWT, attaches user to req
// ─────────────────────────────────────────────
export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.json(401, { error: 'No token provided' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.json(401, { error: 'Invalid or expired token' });
  }

  // Check session is not revoked
  const db = getDb();
  const tokenHash = hashToken(token);
  const session = db.prepare(
    'SELECT id, revoked FROM sessions WHERE token_hash = ? AND user_id = ?'
  ).get(tokenHash, payload.userId);

  if (!session || session.revoked) {
    return res.json(401, { error: 'Session revoked or not found' });
  }

  // Attach user info
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId);
  if (!user) {
    return res.json(401, { error: 'User not found' });
  }

  req.user = user;
  req.sessionId = session.id;
  req.token = token;
  next();
}

// ─────────────────────────────────────────────
// logAudit — write a row to audit_log
// ─────────────────────────────────────────────
export function logAudit(userId, event, severity = 'info', meta = null, ip = null, ua = null) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO audit_log (id, user_id, event, severity, meta, ip, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(newId('aud_'), userId, event, severity, meta ? JSON.stringify(meta) : null, ip, ua);
  } catch (err) {
    console.error('[audit] Failed to write audit log:', err.message);
  }
}

// ─────────────────────────────────────────────
// requestLogger — simple console logger
// ─────────────────────────────────────────────
export function requestLogger(req, res, next) {
  const start = Date.now();
  const originalJson = res.json.bind(res);
  res.json = (status, body) => {
    const ms = Date.now() - start;
    const user = req.user ? `[${req.user.username}]` : '[anon]';
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} → ${status} (${ms}ms) ${user}`);
    return originalJson(status, body);
  };
  next();
}
