// server/auth.js — JWT + password helpers using only node:crypto
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'sovereign-reserve-dev-secret-change-in-production';
const SALT_LEN = 32;
const KEY_LEN = 64;

// ─────────────────────────────────────────────
// Password hashing using scrypt (built-in, FIPS-compatible)
// ─────────────────────────────────────────────
export function hashPassword(password) {
  const salt = randomBytes(SALT_LEN).toString('hex');
  const key = scryptSync(password, salt, KEY_LEN).toString('hex');
  return `${salt}:${key}`;
}

export function comparePassword(password, stored) {
  const [salt, storedKey] = stored.split(':');
  const key = scryptSync(password, salt, KEY_LEN);
  const storedBuf = Buffer.from(storedKey, 'hex');
  return timingSafeEqual(key, storedBuf);
}

// ─────────────────────────────────────────────
// Lightweight JWT implementation (HS256) — no dependencies
// ─────────────────────────────────────────────
function base64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlDecode(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

export function signToken(payload, expiresInHours = 24) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInHours * 3600;
  const body = base64url(JSON.stringify({ ...payload, iat, exp }));
  const sig = createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest();
  return `${header}.${body}.${base64url(sig)}`;
}

export function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expectedSig = base64url(
      createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest()
    );
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(b64urlDecode(body));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashToken(token) {
  return createHmac('sha256', JWT_SECRET).update(token).digest('hex');
}

export function newId(prefix = '') {
  return `${prefix}${randomBytes(8).toString('hex')}`;
}
