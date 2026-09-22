// server.js — Pure Node.js HTTP server (no external dependencies)
// Uses node:http, node:url, node:sqlite (built-ins in Node 24)
import { createServer } from 'node:http';
import { URL } from 'node:url';

import { seedDatabase } from './server/seed.js';
import { requireAuth, requestLogger, logAudit } from './server/middleware.js';

// Route handlers
import { login, biometricLogin, logout, register, getMe } from './server/routes/auth.routes.js';
import { getAccounts, getTransactions, sendWire, toggleCardLock, cardReveal } from './server/routes/vault.routes.js';
import { getKeys, addKey, revokeKey, getSessions, terminateSession, toggleLockdown } from './server/routes/security.routes.js';
import { contactConcierge } from './server/routes/concierge.routes.js';

const PORT = parseInt(process.env.PORT || '3001');

// ─────────────────────────────────────────────
// Micro-router — wraps Node.js IncomingMessage / ServerResponse
// with a minimal express-like API surface
// ─────────────────────────────────────────────

function createContext(req, res, body, params = {}) {
  // Parse query string
  const urlObj = new URL(req.url, `http://localhost`);
  req.query = Object.fromEntries(urlObj.searchParams.entries());
  req.params = params;
  req.body = body;

  // Attach res.json()
  res.json = (status, data) => {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify(data));
  };

  return req;
}

// Read JSON body
async function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString();
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

// Simple route matcher — supports :param segments
function matchRoute(pattern, pathname) {
  const patParts = pattern.split('/');
  const urlParts = pathname.split('/');
  if (patParts.length !== urlParts.length) return null;
  const params = {};
  for (let i = 0; i < patParts.length; i++) {
    if (patParts[i].startsWith(':')) {
      params[patParts[i].slice(1)] = decodeURIComponent(urlParts[i]);
    } else if (patParts[i] !== urlParts[i]) {
      return null;
    }
  }
  return params;
}

// Route table: [method, pattern, ...middlewares, handler]
const ROUTES = [
  // ── Auth (public)
  ['POST', '/api/auth/login',     login],
  ['POST', '/api/auth/biometric', biometricLogin],
  ['POST', '/api/auth/logout',    logout],
  ['POST', '/api/auth/register',  register],
  // ── Auth (protected)
  ['GET',  '/api/auth/me',        requireAuth, getMe],

  // ── Vault (all protected)
  ['GET',  '/api/vault/accounts',        requireAuth, getAccounts],
  ['GET',  '/api/vault/transactions',    requireAuth, getTransactions],
  ['POST', '/api/vault/wire',            requireAuth, sendWire],
  ['POST', '/api/vault/card/lock',       requireAuth, toggleCardLock],
  ['POST', '/api/vault/card/reveal',     requireAuth, cardReveal],

  // ── Security (all protected)
  ['GET',    '/api/security/keys',             requireAuth, getKeys],
  ['POST',   '/api/security/keys',             requireAuth, addKey],
  ['DELETE', '/api/security/keys/:id',         requireAuth, revokeKey],
  ['GET',    '/api/security/sessions',         requireAuth, getSessions],
  ['DELETE', '/api/security/sessions/:id',     requireAuth, terminateSession],
  ['POST',   '/api/security/lockdown',         requireAuth, toggleLockdown],

  // ── Concierge (protected)
  ['POST', '/api/concierge/contact', requireAuth, contactConcierge],
];

// ─────────────────────────────────────────────
// Main request handler
// ─────────────────────────────────────────────
async function handleRequest(req, res) {
  const origin = req.headers['origin'] || '*';

  // CORS headers — allow Vite dev server
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://localhost`);
  const pathname = urlObj.pathname;
  const method = req.method;

  // Find matching route
  let matched = null;
  let matchedParams = {};
  let middlewares = [];
  let handler = null;

  for (const [rm, pattern, ...chain] of ROUTES) {
    if (rm !== method) continue;
    const params = matchRoute(pattern, pathname);
    if (params !== null) {
      matched = true;
      matchedParams = params;
      middlewares = chain.slice(0, -1);
      handler = chain[chain.length - 1];
      break;
    }
  }

  if (!matched) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: pathname }));
    return;
  }

  // Read body for mutating methods
  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    ? await readBody(req)
    : {};

  // Attach helpers
  createContext(req, res, body, matchedParams);

  // Log request
  console.log(`${new Date().toISOString()} ${method} ${pathname}`);

  // Run middleware chain
  let idx = 0;
  const next = () => {
    if (idx < middlewares.length) {
      const mw = middlewares[idx++];
      mw(req, res, next);
    } else {
      handler(req, res);
    }
  };

  try {
    next();
  } catch (err) {
    console.error('[server] Unhandled error:', err);
    if (!res.writableEnded) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
}

// ─────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────
console.log('[server] Initializing Sovereign Reserve API Server...');

try {
  seedDatabase();
} catch (err) {
  console.error('[server] Seed error:', err.message);
}

const server = createServer(handleRequest);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] ✓ Sovereign Reserve API running on http://localhost:${PORT}`);
  console.log(`[server] ✓ SQLite database ready at bank.db`);
  console.log(`[server] ✓ All audit events will be recorded from first login`);
});

server.on('error', (err) => {
  console.error('[server] Fatal error:', err);
  process.exit(1);
});
