// src/api.ts — Shared fetch utility with JWT header injection

const BASE_URL = '/api';
const TOKEN_KEY = 'sr_jwt';

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

interface ApiResult<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export async function apiCall<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResult<T>> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const responseText = await res.text();
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText };
    }

    if (!res.ok) {
      return { data: null, error: data.error || `HTTP ${res.status}`, status: res.status };
    }

    return { data: data as T, error: null, status: res.status };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      status: 0,
    };
  }
}

// ─────────────────────────────────────────────
// Typed API helpers
// ─────────────────────────────────────────────

export const AuthAPI = {
  login: (username: string, password: string, rememberMe = true) =>
    apiCall<{ token: string; profile: unknown; sessionId: string }>('/auth/login', {
      method: 'POST',
      body: { username, password, rememberMe },
      auth: false,
    }),

  biometric: (userId: string) =>
    apiCall<{ token: string; profile: unknown }>('/auth/biometric', {
      method: 'POST',
      body: { userId },
      auth: false,
    }),

  logout: () =>
    apiCall<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  register: (payload: {
    cardLastFour: string;
    cvv: string;
    ssnLast4: string;
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    tier?: string;
  }) =>
    apiCall<{ ok: boolean; token?: string; profile?: unknown }>('/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    }),

  me: () =>
    apiCall<{ profile: unknown }>('/auth/me'),
};

export const VaultAPI = {
  getAccounts: () =>
    apiCall<{ accounts: unknown[] }>('/vault/accounts'),

  getTransactions: (limit = 50, offset = 0) =>
    apiCall<{ transactions: unknown[]; total: number }>(`/vault/transactions?limit=${limit}&offset=${offset}`),

  sendWire: (recipient: string, routing: string, amount: number) =>
    apiCall<{ ok: boolean; hash: string; accounts: unknown[]; transactions: unknown[] }>('/vault/wire', {
      method: 'POST',
      body: { recipient, routing, amount },
    }),

  setCardLock: (lock: boolean) =>
    apiCall<{ ok: boolean; cardLocked: boolean }>('/vault/card/lock', {
      method: 'POST',
      body: { lock },
    }),

  revealCard: () =>
    apiCall<{ ok: boolean }>('/vault/card/reveal', { method: 'POST' }),
};

export const SecurityAPI = {
  getKeys: () =>
    apiCall<{ keys: unknown[] }>('/security/keys'),

  addKey: (name: string, type?: string) =>
    apiCall<{ key: unknown }>('/security/keys', {
      method: 'POST',
      body: { name, type },
    }),

  revokeKey: (id: string) =>
    apiCall<{ ok: boolean }>(`/security/keys/${id}`, { method: 'DELETE' }),

  getSessions: () =>
    apiCall<{ sessions: unknown[] }>('/security/sessions'),

  terminateSession: (id: string) =>
    apiCall<{ ok: boolean }>(`/security/sessions/${id}`, { method: 'DELETE' }),

  setLockdown: (armed: boolean) =>
    apiCall<{ ok: boolean; emergencyLockdown: boolean }>('/security/lockdown', {
      method: 'POST',
      body: { armed },
    }),
};

export const ConciergeAPI = {
  contact: (subject: string, message?: string) =>
    apiCall<{ ok: boolean }>('/concierge/contact', {
      method: 'POST',
      body: { subject, message },
    }),
};
