import React, { useState, useEffect } from 'react';
import { SAMPLE_SECURITY_KEYS } from '../data/mockData';
import { SecurityKeyItem } from '../types';
import { SecurityAPI } from '../api';

export const SecurityScreen: React.FC = () => {
  const [keys, setKeys] = useState<SecurityKeyItem[]>(SAMPLE_SECURITY_KEYS);
  const [sessions, setSessions] = useState<unknown[]>([]);
  const [addingKey, setAddingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [killSwitchTriggered, setKillSwitchTriggered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load real data on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [keysRes, sessRes] = await Promise.all([
        SecurityAPI.getKeys(),
        SecurityAPI.getSessions(),
      ]);
      if (cancelled) return;
      if (keysRes.data?.keys) setKeys(keysRes.data.keys as SecurityKeyItem[]);
      if (sessRes.data?.sessions) setSessions(sessRes.data.sessions as unknown[]);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const { data, error } = await SecurityAPI.addKey(newKeyName);
    if (data?.key) {
      setKeys((prev) => [...prev, data.key as SecurityKeyItem]);
    } else {
      // Fallback: add locally
      const newKey: SecurityKeyItem = {
        id: `sk_${Date.now()}`,
        name: newKeyName,
        type: 'YubiKey 5C NFC',
        addedDate: 'Today',
        lastUsed: 'Registered',
        status: 'active',
      };
      setKeys((prev) => [...prev, newKey]);
    }
    setNewKeyName('');
    setAddingKey(false);
  };

  const handleRevoke = async (id: string) => {
    await SecurityAPI.revokeKey(id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleLockdownToggle = async () => {
    const newState = !killSwitchTriggered;
    setKillSwitchTriggered(newState);
    await SecurityAPI.setLockdown(newState);
  };


  const handleTerminateSession = async (id: string) => {
    await SecurityAPI.terminateSession(id);
    setSessions((prev: any) => prev.filter((s: any) => s.id !== id));
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 gap-6 animate-in fade-in duration-300">
      {/* Zero Trust Status Banner */}
      <div className="bg-[#0d1c32] text-white p-6 rounded-2xl shadow-lg border border-[#1b3a57] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[26px]">enhanced_encryption</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                Defense Level 1 • Optimal
              </span>
              <span className="text-xs text-[#b9c7e4]">AES-256 GCM • FIDO2 WebAuthn</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold mt-0.5">
              Zero-Trust Security Center
            </h2>
          </div>
        </div>

        <button
          onClick={handleLockdownToggle}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            killSwitchTriggered
              ? 'bg-red-600 text-white'
              : 'bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-700/50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">emergency</span>
          <span>{killSwitchTriggered ? 'Emergency Lockdown Active' : 'Arm Emergency Lockdown'}</span>
        </button>
      </div>

      {killSwitchTriggered && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center gap-3 animate-in fade-in">
          <span className="material-symbols-outlined text-[24px] text-red-700">warning</span>
          <div>
            <strong className="block font-semibold">Emergency Enclave Lockdown Engaged:</strong>
            All international wires, debit cards, and secondary device tokens are instantly halted. Only your physical master YubiKey or verified in-person appearance at the Manhattan Flagship can lift this state.
          </div>
        </div>
      )}

      {/* Hardware Security Keys List */}
      <div className="bg-white rounded-2xl p-6 border border-[#dde3eb] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#161c22]">
              Registered Hardware Passkeys &amp; Security Keys
            </h3>
            <p className="text-xs text-[#44474d]">
              FIDO2 cryptographic tokens authorized to unlock your Sovereign Vault.
            </p>
          </div>
          <button
            onClick={() => setAddingKey(true)}
            className="px-3.5 py-1.5 bg-[#0d1c32] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Enroll New Passkey</span>
          </button>
        </div>

        {addingKey && (
          <form
            onSubmit={handleAddKey}
            className="p-4 bg-[#f6f9ff] rounded-xl border border-[#dde3eb] flex flex-col sm:flex-row items-center gap-3 animate-in fade-in"
          >
            <input
              type="text"
              placeholder="e.g. Backup YubiKey 5 NFC (Zurich Safe)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 h-10 px-3 bg-white border border-[#c5c6cd] rounded-lg text-xs text-[#161c22] focus:outline-none"
              required
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-4 h-10 bg-[#0d1c32] text-white text-xs font-semibold rounded-lg"
              >
                Pair Key
              </button>
              <button
                type="button"
                onClick={() => setAddingKey(false)}
                className="px-3 h-10 bg-[#e8eef6] text-[#161c22] text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-[#dde3eb]">
          {keys.map((k) => (
            <div key={k.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#eef4fc] text-[#446180] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    {k.type.includes('Apple') ? 'phonelink_lock' : 'key'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#161c22] block">{k.name}</span>
                  <div className="flex items-center gap-2 text-xs text-[#44474d] mt-0.5">
                    <span className="text-[#446180] font-medium">{k.type}</span>
                    <span>•</span>
                    <span>Last used: {k.lastUsed}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {k.status.toUpperCase()}
                </span>
                <button
                  onClick={() => handleRevoke(k.id)}
                  className="text-xs text-red-600 hover:text-red-800 hover:underline font-semibold"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Enclave Sessions */}
      <div className="bg-white rounded-2xl p-6 border border-[#dde3eb] shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-semibold text-[#161c22]">
          Active Enclave Sessions
        </h3>
        <div className="space-y-3">
          {sessions.length > 0 ? (
            (sessions as any[]).map((sess, idx) => (
              <div key={sess.id || idx} className="p-3.5 rounded-xl bg-[#f6f9ff] border border-[#dde3eb] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#446180] text-[22px]">
                    {sess.method === 'biometric' ? 'fingerprint' : 'lock_clock'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#161c22]">
                        {sess.method === 'biometric' ? 'Biometric Passkey Handshake' : 'Vault Access Session'}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full">
                          Active Token
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#44474d]">
                      IP: {sess.ip || '127.0.0.1'} • Started: {sess.createdAt || 'Recent'} • Method: {sess.method}
                    </span>
                  </div>
                </div>
                {idx > 0 && (
                  <button
                    onClick={() => handleTerminateSession(sess.id)}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Terminate
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-3.5 rounded-xl bg-[#f6f9ff] border border-[#dde3eb] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#446180] text-[22px]">smartphone</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#161c22]">
                      Active Enclave Session
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full">
                      Current Device
                    </span>
                  </div>
                  <span className="text-xs text-[#44474d]">
                    AES-256 GCM Authenticated • Registered in bank.db
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
